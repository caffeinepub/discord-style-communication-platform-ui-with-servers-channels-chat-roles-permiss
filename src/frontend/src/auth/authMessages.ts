// Shared authentication messaging constants for consistent user-facing text

export const AUTH_MESSAGES = {
  // Login errors
  INVALID_CREDENTIALS: 'Invalid email/username or password. Please try again.',
  LOGIN_FAILED: 'Sign in failed. Please try again.',
  LOGIN_NOT_AVAILABLE: 'Sign In is temporarily unavailable. The backend login system is being updated. Please use Sign Up to create a new account.',
  
  // Registration errors
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
