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
  POST_REGISTRATION_LOGIN_FAILED: 'Account created successfully! However, automatic sign-in failed. Please use the Sign In tab to log in with your new credentials.',
  
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
 * Sanitizes an error message with flow-aware fallback
 * Returns an allowlisted message appropriate to the error flow
 */
export function sanitizeAuthMessageForFlow(
  message: string,
  flow: 'signin' | 'signup' | 'connection'
): string {
  // If the message is in our allowlist, return it as-is
  if (ALLOWED_AUTH_MESSAGES.has(message)) {
    return message;
  }
  
  // Return flow-appropriate fallback for non-allowlisted messages
  switch (flow) {
    case 'signin':
      return AUTH_MESSAGES.LOGIN_FAILED;
    case 'signup':
      return AUTH_MESSAGES.REGISTRATION_FAILED;
    case 'connection':
      return AUTH_MESSAGES.CONNECTION_ERROR;
    default:
      return AUTH_MESSAGES.REGISTRATION_FAILED;
  }
}

/**
 * Categorizes an error message into its appropriate flow
 */
export function categorizeErrorFlow(message: string): 'signin' | 'signup' | 'connection' {
  // Check for post-registration login failure (should be shown on signup tab with guidance to signin)
  if (message === AUTH_MESSAGES.POST_REGISTRATION_LOGIN_FAILED) {
    return 'signup';
  }
  
  // Check for sign-in related keywords
  if (
    message.includes('Sign in') ||
    message.includes('login') ||
    message.includes('credentials') ||
    message === AUTH_MESSAGES.INVALID_CREDENTIALS ||
    message === AUTH_MESSAGES.LOGIN_FAILED ||
    message === AUTH_MESSAGES.LOGIN_NOT_AVAILABLE
  ) {
    return 'signin';
  }
  
  // Check for connection related keywords
  if (
    message.includes('connection') ||
    message.includes('backend') ||
    message.includes('timeout') ||
    message === AUTH_MESSAGES.BACKEND_NOT_READY ||
    message === AUTH_MESSAGES.CONNECTION_ERROR ||
    message === AUTH_MESSAGES.CONNECTION_TIMEOUT
  ) {
    return 'connection';
  }
  
  // Default to signup
  return 'signup';
}

/**
 * Maps backend RegistrationError enum to user-friendly messages
 * The backend returns RegistrationError enum values
 */
export function mapRegistrationError(error: any): string {
  if (!error) {
    return AUTH_MESSAGES.REGISTRATION_FAILED;
  }
  
  // Handle enum string values from backend
  // The RegistrationError enum has values: emailTaken, usernameTaken, alreadyRegistered, unknown_
  const errorStr = typeof error === 'string' ? error : String(error);
  
  switch (errorStr) {
    case 'emailTaken':
    case 'usernameTaken':
      return AUTH_MESSAGES.USERNAME_OR_EMAIL_TAKEN;
    case 'alreadyRegistered':
      return AUTH_MESSAGES.ALREADY_REGISTERED;
    case 'unknown_':
    case 'unknown':
      return AUTH_MESSAGES.REGISTRATION_FAILED;
    default:
      console.warn('Unmapped registration error:', error);
      return AUTH_MESSAGES.REGISTRATION_FAILED;
  }
}
