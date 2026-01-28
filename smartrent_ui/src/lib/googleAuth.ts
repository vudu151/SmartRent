/**
 * Google OAuth Helper
 * Handles Google Sign-In integration
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: {
            type: string
            theme: string
            size: string
            text: string
            shape: string
            logo_alignment: string
            width?: string
          }) => void
        }
      }
    }
  }
}

/**
 * Initialize Google Sign-In
 */
export function initializeGoogleSignIn(
  clientId: string,
  onSuccess: (idToken: string) => void,
  onError?: (error: Error) => void
) {
  if (!window.google) {
    if (onError) {
      onError(new Error('Google Sign-In SDK chưa được load. Vui lòng thử lại sau.'))
    }
    return
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          onSuccess(response.credential)
        } else {
          if (onError) {
            onError(new Error('Không thể lấy Google token.'))
          }
        }
      },
      // Add auto_select for better UX
      auto_select: false,
      // Add cancel_on_tap_outside to prevent accidental dismissals
      cancel_on_tap_outside: true,
      // Use popup mode if FedCM fails
      use_fedcm_for_prompt: true,
    })
  } catch (error) {
    if (onError) {
      onError(error instanceof Error ? error : new Error('Lỗi khởi tạo Google Sign-In'))
    }
  }
}

/**
 * Trigger Google Sign-In prompt
 */
export function promptGoogleSignIn() {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt()
  }
}

/**
 * Render Google Sign-In button
 */
export function renderGoogleButton(
  elementId: string,
  clientId: string,
  onSuccess: (idToken: string) => void,
  onError?: (error: Error) => void
) {
  if (!window.google) {
    if (onError) {
      onError(new Error('Google Sign-In SDK chưa được load.'))
    }
    return
  }

  const element = document.getElementById(elementId)
  if (!element) {
    if (onError) {
      onError(new Error(`Không tìm thấy element với id: ${elementId}`))
    }
    return
  }

  try {
    initializeGoogleSignIn(clientId, onSuccess, onError)
    
    window.google.accounts.id.renderButton(element, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
    })
  } catch (error) {
    if (onError) {
      onError(error instanceof Error ? error : new Error('Lỗi render Google button'))
    }
  }
}
