import { apiFetch } from '../lib/http'
import { getUserInfo } from '../lib/token'

export function getTenantId(): number {
  const user = getUserInfo();
  if (user && user.tenantId) {
    return Number(user.tenantId);
  }
  // Fallback for dev purposes
  return 1;
}

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

export interface LoginResponseData {
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

export interface LoginResponse {
  success: boolean
  data?: LoginResponseData
  message?: string
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface GoogleLoginRequest {
  idToken: string
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
  const response = await apiFetch<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: request as any, // http.ts will automatically stringify this
  })
  
  // Check if response indicates error (even with 200 status)
  if (!response.success) {
    const error = new Error(response.error?.message || response.message || 'Sign up failed')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }
  
  return response
}

/**
 * Login API
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: request as any, // http.ts will automatically stringify this
  })
  
  // Check if response indicates error (even with 200 status)
  if (!response.success) {
    const error = new Error(response.error?.message || response.message || 'Login failed')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }
  
  return response
}

/**
 * Refresh token API
 */
export async function refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('/api/auth/refresh', {
    method: 'POST',
    body: request as any, // http.ts will automatically stringify this
  })
  
  // Check if response indicates error (even with 200 status)
  if (!response.success) {
    const error = new Error(response.error?.message || response.message || 'Token refresh failed')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }
  
  return response
}

/**
 * Logout API
 */
export async function logout(): Promise<ApiResponse<void>> {
  return apiFetch<ApiResponse<void>>('/api/auth/logout', {
    method: 'POST',
  })
}

/**
 * Forgot Password API
 * Sends password reset email to user
 */
export async function forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse<void>> {
  const response = await apiFetch<ApiResponse<void>>('/api/auth/forgot-password', {
    method: 'POST',
    body: request as any, // http.ts will automatically stringify this
  })
  
  // Check if response indicates error (even with 200 status)
  if (!response.success) {
    const error = new Error(response.error?.message || response.message || 'Forgot password failed')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }
  
  return response
}

/**
 * Google Login API
 * Authenticate user with Google OAuth ID token
 */
export async function googleLogin(request: GoogleLoginRequest): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('/api/auth/google', {
    method: 'POST',
    body: request as any, // http.ts will automatically stringify this
  })
  
  // Check if response indicates error (even with 200 status)
  if (!response.success) {
    const error = new Error(response.error?.message || response.message || 'Google login failed')
    ;(error as any).error = response.error
    ;(error as any).response = { data: response }
    throw error
  }
  
  return response
}
