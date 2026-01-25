/**
 * API Error class
 */
export class ApiError extends Error {
  readonly status: number
  readonly bodyText?: string
  readonly error?: {
    code?: string
    message?: string
    details?: unknown
  }

  constructor(status: number, message: string, bodyText?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.bodyText = bodyText

    // Try to parse error from response
    if (bodyText) {
      try {
        const parsed = JSON.parse(bodyText)
        if (parsed.error) {
          this.error = parsed.error
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  /**
   * Check if error is authentication related
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403
  }

  /**
   * Get error message
   */
  getErrorMessage(): string {
    return this.error?.message || this.message || 'An error occurred'
  }
}
