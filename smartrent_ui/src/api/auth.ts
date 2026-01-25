import { apiFetch } from '../lib/http'

export interface LoginRequest {
  username: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
  confirmPassword: string
  fullName?: string
  phone?: string
}

export interface LoginResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
    user: {
      id: number
      username: string
      email: string
      fullName: string | null
      tenantId: number | null
      role: string
      permissions: string[]
    }
  }
  message?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

/**
 * Sign Up API
 */
export async function signUp(request: SignUpRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Login API
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Refresh token API
 */
export async function refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Logout API
 */
export async function logout(): Promise<ApiResponse<void>> {
  return apiFetch<ApiResponse<void>>('/api/auth/logout', {
    method: 'POST',
  })
}
