// Shared authentication messaging constants for consistent user-facing text

export const AUTH_MESSAGES = {
  // Login errors
  INVALID_CREDENTIALS: 'Invalid email/username or password. Please try again.',
  LOGIN_FAILED: 'Sign in failed. Please try again.',
  LOGIN_NOT_AVAILABLE: 'Sign In is temporarily unavailable. The backend login system is being updated. Please use Sign Up to create a new account.',
  
  // Registration errors
  USERNAME_OR_EMAIL_TAKEN: 'Username or email is already taken. Please try a different one or sign in.',
  ALREADY_REGISTERED: 'This Internet Identity has already been used to create an account. Please use Sign In instead, or log out and use a different Internet Identity to create a new account.',
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
 * Allowlisted auth messages - only these strings should be shown to users
 */
const ALLOWED_AUTH_MESSAGES = new Set<string>(Object.values(AUTH_MESSAGES));

/**
 * Sanitizes an error message to ensure only allowlisted auth messages are displayed
 */
export function sanitizeAuthMessage(message: string): string {
  // If the message is in our allowlist, return it as-is
  if (ALLOWED_AUTH_MESSAGES.has(message)) {
    return message;
  }
  
  // For any unexpected/raw error, return generic registration failed message
  return AUTH_MESSAGES.REGISTRATION_FAILED;
}

/**
 * Categorizes auth errors by flow type
 */
export function getErrorFlow(message: string): 'signin' | 'signup' | 'session' | 'connection' | 'unknown' {
  if (message === AUTH_MESSAGES.INVALID_CREDENTIALS || message === AUTH_MESSAGES.LOGIN_FAILED || message === AUTH_MESSAGES.LOGIN_NOT_AVAILABLE) {
    return 'signin';
  }
  if (message === AUTH_MESSAGES.USERNAME_OR_EMAIL_TAKEN || message === AUTH_MESSAGES.ALREADY_REGISTERED || message === AUTH_MESSAGES.REGISTRATION_FAILED) {
    return 'signup';
  }
  if (message === AUTH_MESSAGES.SESSION_EXPIRED || message === AUTH_MESSAGES.SESSION_INVALID) {
    return 'session';
  }
  if (message === AUTH_MESSAGES.BACKEND_NOT_READY || message === AUTH_MESSAGES.CONNECTION_ERROR || message === AUTH_MESSAGES.CONNECTION_TIMEOUT) {
    return 'connection';
  }
  return 'unknown';
}

/**
 * Maps backend registration error variants to user-facing messages
 * Handles both enum string values and legacy object shapes
 */
export function mapRegistrationError(error: any): string {
  // Handle null/undefined
  if (!error) {
    return AUTH_MESSAGES.REGISTRATION_FAILED;
  }
  
  // Handle enum string values (current backend interface)
  if (typeof error === 'string') {
    switch (error) {
      case 'alreadyRegistered':
        return AUTH_MESSAGES.ALREADY_REGISTERED;
      case 'usernameTaken':
      case 'emailTaken':
        return AUTH_MESSAGES.USERNAME_OR_EMAIL_TAKEN;
      default:
        return AUTH_MESSAGES.REGISTRATION_FAILED;
    }
  }
  
  // Handle object-shaped variants (legacy or alternative format)
  if (typeof error === 'object') {
    if ('alreadyRegistered' in error) {
      return AUTH_MESSAGES.ALREADY_REGISTERED;
    }
    if ('usernameTaken' in error || 'emailTaken' in error) {
      return AUTH_MESSAGES.USERNAME_OR_EMAIL_TAKEN;
    }
  }
  
  // Fallback for unknown error structure
  return AUTH_MESSAGES.REGISTRATION_FAILED;
}
