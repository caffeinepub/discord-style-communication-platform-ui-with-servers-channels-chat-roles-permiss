import React, { createContext, useState, useEffect, useCallback, useRef, useContext } from 'react';
import { sessionStorage } from './sessionStorage';
import { useBackendConnection } from '../hooks/useBackendConnection';
import { AUTH_MESSAGES, mapRegistrationError, sanitizeAuthMessage } from './authMessages';
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
  const { actor, isReady, isError: connectionError, state: connectionState } = useBackendConnection();
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
            setError('Backend connection error. Please refresh the page.');
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
        const errorMsg = 'Invalid login response from backend. Please try again.';
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
      // Convert bigint expiresAt to number for storage
      const sessionData = {
        token: response.token,
        accountId: response.accountId || '',
        expiresAt: response.expiresAt as any, // Let sessionStorage handle bigint conversion
      };
      
      sessionStorage.save(sessionData);
      setSessionToken(sessionData.token);
      setAccountId(sessionData.accountId);
      setAuthStatus('authenticated');
      setError(null);
    } catch (err: any) {
      // Handle errors gracefully
      let errorMessage = err.message || AUTH_MESSAGES.LOGIN_FAILED;
      
      // Normalize backend trap messages
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Principal mismatch')) {
        errorMessage = AUTH_MESSAGES.INVALID_CREDENTIALS;
      }
      
      // Sanitize to ensure only allowlisted messages
      errorMessage = sanitizeAuthMessage(errorMessage);
      
      setError(errorMessage);
      setAuthStatus('unauthenticated');
      throw new Error(errorMessage);
    }
  }, [actor, isReady]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setError(null);
    
    if (!actor) {
      const errorMsg = AUTH_MESSAGES.BACKEND_NOT_READY;
      setError(errorMsg);
      setAuthStatus('unauthenticated');
      throw new Error(errorMsg);
    }

    try {
      // Defensive check: ensure register exists
      if (typeof actor.register !== 'function') {
        const errorMsg = AUTH_MESSAGES.REGISTRATION_FAILED;
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }

      const payload: RegisterPayload = {
        username,
        email,
        password,
      };
      
      // Backend returns RegistrationError | null
      // null = success, error object = failure with reason
      const errorResponse: RegistrationError | null = await actor.register(payload);
      
      if (errorResponse !== null) {
        // Registration failed - map the error to a user-friendly message
        const errorMsg = mapRegistrationError(errorResponse);
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
      // Registration succeeded - now log in to get a session
      // The backend creates the user but doesn't return a session from register
      // We need to call login to get the session token
      await login(username, password);
      
    } catch (err: any) {
      // Sanitize error message to ensure only allowlisted messages reach the UI
      let errorMessage = err.message || AUTH_MESSAGES.REGISTRATION_FAILED;
      
      // Strip any multi-line content or unexpected text
      // Only keep the first line if it's an allowlisted message
      const firstLine = errorMessage.split('\n')[0].trim();
      errorMessage = sanitizeAuthMessage(firstLine);
      
      setError(errorMessage);
      setAuthStatus('unauthenticated');
      throw new Error(errorMessage);
    }
  }, [actor, login]);

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
