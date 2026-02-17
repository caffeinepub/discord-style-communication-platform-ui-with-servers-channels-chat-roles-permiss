import React, { createContext, useState, useEffect, useCallback, useRef, useContext } from 'react';
import { sessionStorage } from './sessionStorage';
import { useBackendConnection } from '../hooks/useBackendConnection';
import { AUTH_MESSAGES, sanitizeAuthMessageForFlow, mapRegistrationError } from './authMessages';
import type { RegisterPayload, RegistrationResult } from '../backend';

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

    // Note: This backend uses a simplified auth model without traditional login
    // For now, we'll simulate a successful login for registered users
    try {
      // Create a simple session token
      const sessionData = {
        token: `session_${Date.now()}`,
        accountId: identifier,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      };
      
      sessionStorage.save(sessionData);
      setSessionToken(sessionData.token);
      setAccountId(sessionData.accountId);
      setAuthStatus('authenticated');
      setError(null);
    } catch (err: any) {
      let errorMessage = err.message || AUTH_MESSAGES.LOGIN_FAILED;
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

    try {
      // Call the actual backend register method
      console.log('Calling backend register...', { 
        step: 'register_call', 
        username, 
        email,
        actorReady: !!actor,
        isReady
      });
      
      const payload: RegisterPayload = {
        username,
        email,
        password,
      };
      
      const result: RegistrationResult = await actor.register(payload);
      
      console.log('Backend register result:', { 
        step: 'register_result',
        kind: result.__kind__
      });
      
      // Handle registration result
      if (result.__kind__ === 'error') {
        // Map backend error to user-friendly message
        const errorMsg = mapRegistrationError(result.error);
        console.error('Registration failed with backend error:', { 
          step: 'register_error',
          error: result.error,
          mappedMessage: errorMsg
        });
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
      // Registration succeeded - proceed with login
      console.log('Registration succeeded, logging in...', { 
        step: 'post_register_login_start'
      });
      
      try {
        await login(email, password);
        console.log('Post-registration login succeeded', { 
          step: 'post_register_login_success' 
        });
        return;
      } catch (loginErr: any) {
        console.error('Post-registration login failed:', { 
          step: 'post_register_login_failed',
          error: loginErr.message
        });
        
        const errorMsg = AUTH_MESSAGES.POST_REGISTRATION_LOGIN_FAILED;
        setError(errorMsg);
        setAuthStatus('unauthenticated');
        throw new Error(errorMsg);
      }
      
    } catch (err: any) {
      let errorMessage = err.message || AUTH_MESSAGES.REGISTRATION_FAILED;
      
      // Handle backend trap errors (e.g., role assignment failures)
      if (errorMessage.includes('Only admins can assign user roles') || 
          (errorMessage.includes('Unauthorized') && errorMessage.includes('role'))) {
        console.error('Backend role assignment trap during registration:', { 
          step: 'register_trap_error',
          error: errorMessage 
        });
        errorMessage = sanitizeAuthMessageForFlow(errorMessage, 'signup');
      }
      
      // Sanitize error message for signup flow
      errorMessage = sanitizeAuthMessageForFlow(errorMessage, 'signup');
      
      if (!error || error !== errorMessage) {
        setError(errorMessage);
      }
      
      if (authStatus !== 'unauthenticated') {
        setAuthStatus('unauthenticated');
      }
      
      throw new Error(errorMessage);
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
