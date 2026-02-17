import React, { createContext, useState, useEffect, useCallback, useRef, useContext } from 'react';
import { sessionStorage } from './sessionStorage';
import { useBackendConnection } from '../hooks/useBackendConnection';
import { AUTH_MESSAGES, mapRegistrationError, sanitizeAuthMessageForFlow } from './authMessages';
import type { RegisterPayload, LoginPayload, Session, RegistrationError } from '../backend';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextValue {
  authStatus: AuthStatus;
  sessionToken: string | null;
  accountId: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const INITIALIZATION_TIMEOUT_MS = 15000; // 15 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { actor, isReady, isError: connectionError } = useBackendConnection();
  const initializationAttempted = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize: try to restore session from storage
  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent multiple initialization attempts
      if (initializationAttempted.current) {
        return;
      }

      const session = sessionStorage.load();
      
      if (!session) {
        initializationAttempted.current = true;
        setAuthStatus('unauthenticated');
        return;
      }

      // Validate session with backend when actor is ready
      if (isReady && actor) {
        initializationAttempted.current = true;
        
        // Clear any existing timeout
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
          initializationTimeoutRef.current = null;
        }

        try {
          // Defensive check: ensure validateSession exists
          if (typeof actor.validateSession !== 'function') {
            console.error('Backend actor missing validateSession method');
            sessionStorage.clearWithReason('Backend actor incompatible - missing validateSession');
            setAuthStatus('unauthenticated');
            setError(sanitizeAuthMessageForFlow('Backend connection error', 'connection'));
            return;
          }

          const validatedSession = await actor.validateSession(session.token);
          
          if (!validatedSession) {
            // Session is invalid or expired
            sessionStorage.clearWithReason('Session validation returned null');
            setAuthStatus('unauthenticated');
            setError(AUTH_MESSAGES.SESSION_EXPIRED);
            return;
          }
          
          // Session is valid, restore auth state
          setSessionToken(validatedSession.token);
          setAccountId(validatedSession.accountId || null);
          setAuthStatus('authenticated');
          setError(null);
        } catch (err) {
          console.error('Session validation failed:', err);
          sessionStorage.clearWithReason('Session validation threw error');
          setAuthStatus('unauthenticated');
          setError(AUTH_MESSAGES.SESSION_INVALID);
        }
      } else if (connectionError) {
        // Backend connection failed - clear session and show error
        initializationAttempted.current = true;
        
        // Clear any existing timeout
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
          initializationTimeoutRef.current = null;
        }

        sessionStorage.clearWithReason('Backend connection error during initialization');
        setAuthStatus('unauthenticated');
        setError(AUTH_MESSAGES.CONNECTION_ERROR);
      }
    };

    if (authStatus === 'initializing') {
      initializeAuth();
    }
  }, [isReady, actor, authStatus, connectionError]);

  // Set up initialization timeout to prevent infinite loading
  useEffect(() => {
    if (authStatus === 'initializing' && !initializationTimeoutRef.current) {
      initializationTimeoutRef.current = setTimeout(() => {
        if (authStatus === 'initializing') {
          console.warn('Auth initialization timed out');
          initializationAttempted.current = true;
          
          // Clear stored session if we couldn't validate it
          const session = sessionStorage.load();
          if (session) {
            sessionStorage.clearWithReason('Initialization timeout - backend not reachable');
          }
          
          setAuthStatus('unauthenticated');
          setError(AUTH_MESSAGES.CONNECTION_TIMEOUT);
        }
      }, INITIALIZATION_TIMEOUT_MS);
    }

    // Cleanup timeout on unmount or when auth status changes
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
        initializationTimeoutRef.current = null;
      }
    };
  }, [authStatus]);

  const login = useCallback(async (identifier: string, password: string) => {
    setError(null);
    
    if (!actor || !isReady) {
      const errorMsg = AUTH_MESSAGES.BACKEND_NOT_READY;
      setError(errorMsg);
      setAuthStatus('unauthenticated');
      throw new Error(errorMsg);
    }

    // Defensive check: ensure login exists
    if (typeof actor.login !== 'function') {
      const errorMsg = AUTH_MESSAGES.LOGIN_NOT_AVAILABLE;
      console.error('Login attempt failed: backend login method not available');
      setError(errorMsg);
      setAuthStatus('unauthenticated');
      throw new Error(errorMsg);
    }

    try {
      const payload: LoginPayload = {
        loginIdentifier: identifier,
        password: password,
      };
      
      const response: Session | null = await actor.login(payload);
      
      if (!response) {
        // Backend returned null - invalid credentials
        const errorMsg = AUTH_MESSAGES.INVALID_CREDENTIALS;
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
      // Validate response structure
      if (!response.token) {
        const errorMsg = sanitizeAuthMessageForFlow('Invalid login response from backend', 'signin');
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
      // Convert bigint expiresAt to number for storage
      const sessionData = {
        token: response.token,
        accountId: response.accountId, // Pass through as-is (optional)
        expiresAt: response.expiresAt as any, // Let sessionStorage handle bigint conversion
      };
      
      sessionStorage.save(sessionData);
      setSessionToken(sessionData.token);
      setAccountId(sessionData.accountId || null);
      setAuthStatus('authenticated');
      setError(null);
    } catch (err: any) {
      // Handle errors gracefully
      let errorMessage = err.message || AUTH_MESSAGES.LOGIN_FAILED;
      
      // Normalize backend trap messages
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Principal mismatch')) {
        errorMessage = AUTH_MESSAGES.INVALID_CREDENTIALS;
      }
      
      // Sanitize to ensure only allowlisted messages (sign-in flow)
      errorMessage = sanitizeAuthMessageForFlow(errorMessage, 'signin');
      
      setError(errorMessage);
      setAuthStatus('unauthenticated');
      throw new Error(errorMessage);
    }
  }, [actor, isReady]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setError(null);
    
    // Check backend readiness before attempting registration
    if (!actor || !isReady) {
      const errorMsg = AUTH_MESSAGES.BACKEND_NOT_READY;
      console.error('Registration attempt failed: backend not ready', { 
        step: 'backend_ready_check',
        actor: !!actor, 
        isReady 
      });
      setError(errorMsg);
      setAuthStatus('unauthenticated');
      throw new Error(errorMsg);
    }

    // Defensive check: ensure register exists
    if (typeof actor.register !== 'function') {
      const errorMsg = AUTH_MESSAGES.REGISTRATION_FAILED;
      console.error('Registration attempt failed: backend register method not available', {
        step: 'register_method_check'
      });
      setError(errorMsg);
      setAuthStatus('unauthenticated');
      throw new Error(errorMsg);
    }

    try {
      const payload: RegisterPayload = {
        username,
        email,
        password,
      };
      
      console.log('Attempting registration...', { 
        step: 'register_call', 
        username, 
        email,
        actorReady: !!actor,
        isReady
      });
      
      // Backend returns RegistrationError | null
      // null = success, error object = failure with reason
      const errorResponse: RegistrationError | null = await actor.register(payload);
      
      if (errorResponse !== null) {
        // Registration failed - map the error to a user-friendly message
        const errorMsg = mapRegistrationError(errorResponse);
        console.error('Registration failed:', { 
          step: 'register_call', 
          error: errorResponse, 
          mappedMessage: errorMsg 
        });
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
      console.log('Registration succeeded, attempting post-registration login...', { 
        step: 'post_register_login_start',
        actorReady: !!actor,
        isReady
      });
      
      // Registration succeeded - now log in to get a session
      try {
        // Call login - this will handle session creation and state updates
        await login(username, password);
        console.log('Post-registration login succeeded', { 
          step: 'post_register_login_success' 
        });
        // Login succeeded - state is now authenticated, no need to set error
      } catch (loginErr: any) {
        // Post-registration login failed - this is a sign-in error, not a registration error
        console.error('Post-registration login failed:', { 
          step: 'post_register_login_error', 
          error: loginErr.message || loginErr 
        });
        
        // Sanitize the error for sign-in flow (not registration flow)
        const errorMsg = sanitizeAuthMessageForFlow(
          loginErr.message || AUTH_MESSAGES.LOGIN_FAILED, 
          'signin'
        );
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
    } catch (err: any) {
      // Determine if this is a registration error or a login error
      const errorMessage = err.message || AUTH_MESSAGES.REGISTRATION_FAILED;
      
      // If the error is already an allowlisted message, use it as-is
      // Otherwise, categorize based on the error content
      let flow: 'signin' | 'signup' = 'signup';
      
      // Check if this is a sign-in related error
      if (
        errorMessage.includes('Sign in') ||
        errorMessage.includes('login') ||
        errorMessage === AUTH_MESSAGES.INVALID_CREDENTIALS ||
        errorMessage === AUTH_MESSAGES.LOGIN_FAILED
      ) {
        flow = 'signin';
      }
      
      // Sanitize for the appropriate flow
      const sanitizedMessage = sanitizeAuthMessageForFlow(errorMessage, flow);
      
      // Only set error if it's not already set (avoid overwriting more specific errors)
      if (!error) {
        setError(sanitizedMessage);
      }
      
      // Ensure we're in unauthenticated state
      if (authStatus !== 'unauthenticated') {
        setAuthStatus('unauthenticated');
      }
      
      throw new Error(sanitizedMessage);
    }
  }, [actor, isReady, login, error, authStatus]);

  const logout = useCallback(async () => {
    sessionStorage.clear();
    setSessionToken(null);
    setAccountId(null);
    setAuthStatus('unauthenticated');
    setError(null);
  }, []);

  const value: AuthContextValue = {
    authStatus,
    sessionToken,
    accountId,
    login,
    register,
    logout,
    error,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
