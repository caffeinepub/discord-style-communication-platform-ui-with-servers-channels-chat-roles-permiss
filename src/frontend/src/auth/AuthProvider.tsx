import React, { createContext, useState, useEffect, useCallback, useRef, useContext } from 'react';
import { sessionStorage } from './sessionStorage';
import { useBackendConnection } from '../hooks/useBackendConnection';
import { AUTH_MESSAGES, mapRegistrationError, sanitizeAuthMessageForFlow } from './authMessages';
import type { RegisterPayload, LoginPayload, Session, RegistrationResult } from '../backend';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextValue {
  authStatus: AuthStatus;
  sessionToken: string | null;
  accountId: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
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

      // Session exists in storage - restore it when backend is ready
      if (isReady && actor) {
        initializationAttempted.current = true;
        
        // Clear any existing timeout
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
          initializationTimeoutRef.current = null;
        }

        // Check if session has expired
        if (session.expiresAt && session.expiresAt > 0 && Date.now() > session.expiresAt) {
          console.log('Session expired during initialization');
          sessionStorage.clearWithReason('Session expired');
          setAuthStatus('unauthenticated');
          setError(AUTH_MESSAGES.SESSION_EXPIRED);
          return;
        }
        
        // Session is valid, restore auth state
        console.log('Restoring session from storage');
        setSessionToken(session.token);
        setAccountId(session.accountId || null);
        setAuthStatus('authenticated');
        setError(null);
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
      
      // Session type has: token, expiresAt (bigint), email
      // Store session data
      const sessionData = {
        token: response.token,
        accountId: response.email, // Use email as accountId for compatibility
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
      
      // Backend returns RegistrationResult discriminated union
      // { __kind__: "success", success: null } or { __kind__: "error", error: RegistrationError }
      const result: RegistrationResult = await actor.register(payload);
      
      console.log('Registration result received:', { 
        step: 'register_response', 
        resultKind: result.__kind__,
        result
      });
      
      // Check if registration failed
      if (result.__kind__ === 'error') {
        // Registration failed - map the error to a user-friendly message
        const errorMsg = mapRegistrationError(result.error);
        console.error('Registration failed:', { 
          step: 'register_error', 
          error: result.error, 
          mappedMessage: errorMsg 
        });
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
      // Registration succeeded (__kind__ === 'success')
      console.log('Registration succeeded, attempting post-registration login...', { 
        step: 'post_register_login_start',
        actorReady: !!actor,
        isReady
      });
      
      // Now log in to get a session - try email first, then username
      try {
        // Try logging in with email first (most reliable)
        await login(email, password);
        console.log('Post-registration login succeeded with email', { 
          step: 'post_register_login_success' 
        });
        // Login succeeded - state is now authenticated
        return;
      } catch (emailLoginErr: any) {
        console.warn('Post-registration login with email failed, trying username...', { 
          step: 'post_register_login_email_failed',
          error: emailLoginErr.message 
        });
        
        // Try with username as fallback
        try {
          await login(username, password);
          console.log('Post-registration login succeeded with username', { 
            step: 'post_register_login_success_username' 
          });
          // Login succeeded - state is now authenticated
          return;
        } catch (usernameLoginErr: any) {
          // Both login attempts failed - this is a critical error
          console.error('Post-registration login failed with both email and username:', { 
            step: 'post_register_login_both_failed',
            emailError: emailLoginErr.message,
            usernameError: usernameLoginErr.message
          });
          
          // Registration succeeded but login failed - show a specific message
          const errorMsg = AUTH_MESSAGES.POST_REGISTRATION_LOGIN_FAILED;
          setError(errorMsg);
          setAuthStatus('unauthenticated');
          throw new Error(errorMsg);
        }
      }
      
    } catch (err: any) {
      // If error is already set and matches the thrown error, don't overwrite
      const errorMessage = err.message || AUTH_MESSAGES.REGISTRATION_FAILED;
      
      // Only update error if it's not already set to avoid overwriting more specific errors
      if (!error || error !== errorMessage) {
        setError(errorMessage);
      }
      
      // Ensure we're in unauthenticated state
      if (authStatus !== 'unauthenticated') {
        setAuthStatus('unauthenticated');
      }
      
      throw err;
    }
  }, [actor, isReady, login, error, authStatus]);

  const logout = useCallback(async () => {
    sessionStorage.clear();
    setSessionToken(null);
    setAccountId(null);
    setAuthStatus('unauthenticated');
    setError(null);
  }, []);

  const clearError = useCallback(() => {
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
    clearError,
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
