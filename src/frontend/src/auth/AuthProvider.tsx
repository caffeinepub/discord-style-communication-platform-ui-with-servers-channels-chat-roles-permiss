import React, { createContext, useState, useEffect, useCallback } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { actor, isReady } = useBackendConnection();

  // Initialize: try to restore session from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const session = sessionStorage.load();
      
      if (!session) {
        setAuthStatus('unauthenticated');
        return;
      }

      // Validate session with backend when actor is ready
      if (isReady && actor) {
        try {
          const validatedSession = await actor.validateSession(session.token);
          
          if (!validatedSession) {
            // Session is invalid or expired
            sessionStorage.clear();
            setAuthStatus('unauthenticated');
            return;
          }
          
          // Session is valid, restore auth state
          setSessionToken(validatedSession.token);
          setAccountId(validatedSession.accountId);
          setAuthStatus('authenticated');
        } catch (err) {
          console.error('Session validation failed:', err);
          sessionStorage.clear();
          setAuthStatus('unauthenticated');
        }
      } else if (!isReady) {
        // Wait for backend to be ready before validating
        return;
      }
    };

    if (authStatus === 'initializing') {
      initializeAuth();
    }
  }, [isReady, actor, authStatus]);

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
