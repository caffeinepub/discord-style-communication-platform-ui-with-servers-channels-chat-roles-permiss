// Shared authentication messaging constants for consistent user-facing text

export const AUTH_MESSAGES = {
  // Login errors
  INVALID_CREDENTIALS: 'Invalid email/username or password. Please try again.',
  LOGIN_FAILED: 'Sign in failed. Please try again.',
  LOGIN_NOT_AVAILABLE: 'Sign In is temporarily unavailable. The backend login system is being updated. Please use Sign Up to create a new account.',
  
  // Registration errors
  USERNAME_OR_EMAIL_TAKEN: 'Username or email is already taken. Please try a different one or sign in.',
  ALREADY_REGISTERED: 'This account is already registered. Please sign in instead.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  
  // Session errors
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  SESSION_INVALID: 'Unable to validate your session. Please sign in again.',
  
  // Connection errors
  BACKEND_NOT_READY: 'Backend connection not ready. Please wait a moment and try again.',
  CONNECTION_ERROR: 'Unable to connect to the backend. Please check that the local replica is running and try again.',
  CONNECTION_TIMEOUT: 'Connection timeout. Please check that the local replica is running and refresh the page.',
} as const;

/**
 * Maps backend registration error variants to user-facing messages
 */
export function mapRegistrationError(error: { notAGuest?: null; usernameTaken?: null; emailTaken?: null } | string): string {
  // Handle string-based error (for backwards compatibility or unknown errors)
  if (typeof error === 'string') {
    return AUTH_MESSAGES.REGISTRATION_FAILED;
  }
  
  // Map backend RegistrationError variants
  if ('notAGuest' in error) {
    return AUTH_MESSAGES.ALREADY_REGISTERED;
  }
  if ('usernameTaken' in error || 'emailTaken' in error) {
    return AUTH_MESSAGES.USERNAME_OR_EMAIL_TAKEN;
  }
  
  // Fallback for unknown error structure
  return AUTH_MESSAGES.REGISTRATION_FAILED;
}
