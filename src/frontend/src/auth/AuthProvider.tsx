import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { sessionStorage } from './sessionStorage';
import { useBackendConnection } from '../hooks/useBackendConnection';
import type { RegisterPayload } from '../backend';

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
          const validatedSession = await actor.validateSession(session.token);
          
          if (!validatedSession) {
            // Session is invalid or expired
            sessionStorage.clearWithReason('Session validation returned null');
            setAuthStatus('unauthenticated');
            setError('Your session has expired. Please sign in again.');
            return;
          }
          
          // Session is valid, restore auth state
          setSessionToken(validatedSession.token);
          setAccountId(validatedSession.accountId);
          setAuthStatus('authenticated');
          setError(null);
        } catch (err) {
          console.error('Session validation failed:', err);
          sessionStorage.clearWithReason('Session validation threw error');
          setAuthStatus('unauthenticated');
          setError('Unable to validate your session. Please sign in again.');
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
        setError('Unable to connect to the backend. Please check that the local replica is running and try again.');
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
          setError('Connection timeout. Please check that the local replica is running and refresh the page.');
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
    
    if (!actor) {
      const errorMsg = 'Backend connection not ready';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // TODO: Call backend login endpoint when available
      // Expected backend signature: login(identifier: Text, password: Text) -> { token: Text; accountId: Text; expiresAt: Nat }
      // const response = await actor.login(identifier, password);
      
      // Temporary: throw error until backend implements login
      throw new Error('Login endpoint not yet implemented in backend. Please wait for backend authentication system to be updated.');
      
      // When backend is ready, use this code:
      /*
      const sessionData = {
        token: response.token,
        accountId: response.accountId,
        expiresAt: Number(response.expiresAt),
      };
      
      sessionStorage.save(sessionData);
      setSessionToken(sessionData.token);
      setAccountId(sessionData.accountId);
      setAuthStatus('authenticated');
      setError(null);
      */
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      setAuthStatus('error');
      throw new Error(errorMessage);
    }
  }, [actor]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setError(null);
    
    if (!actor) {
      const errorMsg = 'Backend connection not ready';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const payload: RegisterPayload = {
        username,
        email,
        password,
      };
      
      const response = await actor.register(payload);
      
      // Convert bigint expiresAt to number for storage
      const sessionData = {
        token: response.token,
        accountId: response.accountId,
        expiresAt: Number(response.expiresAt),
      };
      
      sessionStorage.save(sessionData);
      setSessionToken(sessionData.token);
      setAccountId(sessionData.accountId);
      setAuthStatus('authenticated');
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      setAuthStatus('error');
      throw new Error(errorMessage);
    }
  }, [actor]);

  const logout = useCallback(async () => {
    if (actor && sessionToken) {
      try {
        // TODO: Call backend logout endpoint when available
        // Expected backend signature: logout(token: Text) -> ()
        // await actor.logout(sessionToken);
      } catch (err) {
        console.error('Logout error:', err);
        // Continue with local logout even if backend call fails
      }
    }

    sessionStorage.clear();
    setSessionToken(null);
    setAccountId(null);
    setAuthStatus('unauthenticated');
    setError(null);
  }, [actor, sessionToken]);

  const value: AuthContextValue = {
    authStatus,
    sessionToken,
    accountId,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
