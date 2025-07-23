export interface AuthError {
  message: string
  code: string
  details?: string
  provider?: string
}

export const createAuthError = (code: string, message: string, details?: string): AuthError => ({
  code,
  message,
  details
})

export const authErrorCodes = {
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_NOT_FOUND: 'user_not_found',
  PROFILE_ERROR: 'profile_error',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error'
} as const

export type AuthErrorCode = typeof authErrorCodes[keyof typeof authErrorCodes]