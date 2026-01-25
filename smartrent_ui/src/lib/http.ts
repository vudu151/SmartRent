import { env } from '../config/env'
import { getBasicAuthHeader } from './auth'
import { getAccessToken } from './token'

// Re-export ApiError for convenience
export { ApiError } from './apiError'

function resolveUrl(path: string) {
  // Allow absolute URLs
  if (/^https?:\/\//i.test(path)) return path

  // If base URL is set -> call backend directly (prod/remote)
  // If not -> use relative path (dev proxy via Vite)
  const base = env.apiBaseUrl?.replace(/\/+$/, '')
  return base ? `${base}${path.startsWith('/') ? '' : '/'}${path}` : path
}

type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

export async function apiFetch<T = unknown>(
  path: string,
  init: Omit<RequestInit, 'body'> & { body?: Json | FormData | string } = {},
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

  let body: BodyInit | undefined
  if (init.body instanceof FormData) {
    body = init.body
  } else if (typeof init.body === 'string') {
    body = init.body
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'text/plain; charset=utf-8')
  } else if (init.body !== undefined) {
    body = JSON.stringify(init.body)
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(resolveUrl(path), {
    ...init,
    headers,
    body,
  })

  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, `Request failed: ${res.status} ${res.statusText}`, text)
  }

  if (res.status === 204) return undefined as T
  if (isJson) return (await res.json()) as T
  return (await res.text()) as T
}
