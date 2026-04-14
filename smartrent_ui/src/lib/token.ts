/**
 * Token storage utilities
 */

const ACCESS_TOKEN_KEY = 'smartrent.accessToken'
const REFRESH_TOKEN_KEY = 'smartrent.refreshToken'
const USER_KEY = 'smartrent.user'

export interface UserInfo {
  id: number
  username: string
  email: string
  fullName: string | null
  tenantId: number | null
  role: string
  avatarUrl: string | null
  permissions: string[]
}

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Get user info from storage
 */
export function getUserInfo(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Save tokens and user info
 */
export function saveTokens(accessToken: string, refreshToken: string, user: UserInfo): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Clear all tokens and user info
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken()
}
