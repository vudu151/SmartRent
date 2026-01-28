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

    // Try to parse error from response body
    if (bodyText) {
      try {
        const parsed = JSON.parse(bodyText)
        // Backend returns: { success: false, error: { code, message, details } }
        if (parsed.error && typeof parsed.error === 'object') {
          this.error = parsed.error
          // Update message if error.message exists
          if (parsed.error.message) {
            this.message = parsed.error.message
          }
        }
      } catch (parseError) {
        // If not JSON, ignore parse errors
        // bodyText will be available for debugging
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
    // Priority: error.message > this.message > default
    if (this.error?.message) {
      return this.error.message
    }
    if (this.message && this.message !== 'An error occurred') {
      return this.message
    }
    return 'Đã xảy ra lỗi. Vui lòng thử lại.'
  }
}
