import { env } from '../config/env'
import { getBasicAuthHeader } from './auth'
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './token'
import { ApiError } from './apiError'
import { refreshToken as refreshTokenApi } from '../api/auth'

// Re-export ApiError for convenience
export { ApiError }

function resolveUrl(path: string) {
  // Allow absolute URLs
  if (/^https?:\/\//i.test(path)) return path

  // If base URL is set -> call backend directly (prod/remote)
  // If not -> use relative path (dev proxy via Vite)
  const base = env.apiBaseUrl?.replace(/\/+$/, '')
  return base ? `${base}${path.startsWith('/') ? '' : '/'}${path}` : path
}

type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

// Debug mode - set to true via env var to enable detailed logging
const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true'

export async function apiFetch<T = unknown>(
  path: string,
  init: Omit<RequestInit, 'body'> & { body?: Json | FormData | string | object } = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  // Add JWT token if available
  const accessToken = getAccessToken()
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  // Add Basic Auth if configured (for backward compatibility)
  const basic = getBasicAuthHeader()
  if (basic && !headers.has('Authorization')) {
    headers.set('Authorization', basic)
  }

  // Add Building context header
  const buildingId = localStorage.getItem('selectedBuildingId')
  if (buildingId && !headers.has('X-Building-Id')) {
    headers.set('X-Building-Id', buildingId)
  }

  let body: BodyInit | undefined
  if (init.body instanceof FormData) {
    body = init.body
  } else if (typeof init.body === 'string') {
    // If body is already a string, check if it's JSON
    body = init.body
    if (init.body.trim().startsWith('{') || init.body.trim().startsWith('[')) {
      // It's JSON string, set JSON content type
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    } else {
      // Plain text
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'text/plain; charset=utf-8')
    }
  } else if (init.body !== undefined && init.body !== null) {
    // Object/array - stringify it (handles both Json type and object types)
    body = JSON.stringify(init.body as Json | object)
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  const url = resolveUrl(path)
  
  // Debug: Log request details
  if (DEBUG_MODE) {
    console.group(`🔵 API Request: ${init.method || 'GET'} ${path}`)
    console.log('URL:', url)
    console.log('Method:', init.method || 'GET')
    console.log('Headers:', Object.fromEntries(headers.entries()))
    if (body) {
      try {
        const bodyStr = typeof body === 'string' ? body : 'FormData'
        const bodyObj = typeof body === 'string' && body.startsWith('{') ? JSON.parse(body) : bodyStr
        console.log('Body:', bodyObj)
      } catch {
        console.log('Body:', body)
      }
    }
    console.groupEnd()
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body,
  })

  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  // Debug: Log response details
  if (DEBUG_MODE) {
    console.group(`🟢 API Response: ${init.method || 'GET'} ${path}`)
    console.log('Status:', res.status, res.statusText)
    console.log('Headers:', Object.fromEntries(res.headers.entries()))
    console.groupEnd()
  }

  if (!res.ok) {
    // Handle 401/403 - try to refresh token if available
    if ((res.status === 401 || res.status === 403) && getAccessToken()) {
      // Try to refresh token
      try {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const refreshResponse = await refreshTokenApi({ refreshToken })
          if (refreshResponse.success && refreshResponse.data) {
            saveTokens(
              refreshResponse.data.accessToken,
              refreshResponse.data.refreshToken,
              refreshResponse.data.user
            )
            // Retry the original request with new token
            const newAccessToken = refreshResponse.data.accessToken
            headers.set('Authorization', `Bearer ${newAccessToken}`)
            const retryRes = await fetch(url, {
              ...init,
              headers,
              body,
            })
            if (retryRes.ok) {
              const contentType = retryRes.headers.get('content-type') ?? ''
              const isJson = contentType.includes('application/json')
              if (retryRes.status === 204) return undefined as T
              if (isJson) {
                const jsonData = await retryRes.json()
                if (DEBUG_MODE) {
                  console.log('✅ Retry after token refresh succeeded')
                }
                return jsonData as T
              }
              return (await retryRes.text()) as T
            }
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/sign-in'
        }
      }
    }

    const text = await res.text().catch(() => '')
    let errorMessage = `Request failed: ${res.status} ${res.statusText}`
    let errorInfo: { code?: string; message?: string; details?: unknown } | undefined
    
    // Try to parse error from response body
    if (text) {
      try {
        const parsed = JSON.parse(text)
        // Check for ApiResponse format with error field (backend format: { success: false, error: { code, message } })
        if (parsed.error && typeof parsed.error === 'object') {
          errorInfo = parsed.error
          errorMessage = parsed.error.message || errorMessage
        } 
        // Check for direct message field
        else if (parsed.message) {
          errorMessage = parsed.message
        }
      } catch (parseError) {
        // If not JSON, use text as message
        if (text && text.trim()) {
          errorMessage = text
        }
      }
    }
    
    // Create ApiError with parsed information
    const apiError = new ApiError(res.status, errorMessage, text)
    if (errorInfo) {
      ;(apiError as any).error = errorInfo
    }
    
    // Debug: Log error details
    if (DEBUG_MODE) {
      console.group(`🔴 API Error: ${init.method || 'GET'} ${path}`)
      console.error('Status:', res.status)
      console.error('Message:', errorMessage)
      console.error('Error Info:', errorInfo)
      console.error('Response Body:', text)
      console.error('Has Token:', !!getAccessToken())
      console.groupEnd()
    }
    
    throw apiError
  }

  if (res.status === 204) return undefined as T
  
  // Parse response
  try {
    if (isJson) {
      const jsonData = await res.json()
      // Debug: Log successful response
      if (DEBUG_MODE) {
        console.group(`✅ API Success: ${init.method || 'GET'} ${path}`)
        console.log('Response Data:', jsonData)
        console.groupEnd()
      }
      return jsonData as T
    }
    const textData = await res.text()
    return textData as T
  } catch (parseError) {
    // If parsing fails, throw a more descriptive error
    const errorText = await res.text().catch(() => 'Unable to read response')
    const parseErrorMsg = parseError instanceof Error ? parseError.message : 'Unknown parse error'
    
    if (DEBUG_MODE) {
      console.group(`❌ Parse Error: ${init.method || 'GET'} ${path}`)
      console.error('Parse Error:', parseErrorMsg)
      console.error('Response Text:', errorText)
      console.groupEnd()
    }
    
    throw new ApiError(
      res.status,
      `Failed to parse response: ${parseErrorMsg}`,
      errorText
    )
  }
}
