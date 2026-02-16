import React, { createContext, useState, useEffect, useCallback } from 'react';
import { sessionStorage } from './sessionStorage';
import { useBackendConnection } from '../hooks/useBackendConnection';

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
          // TODO: Call backend validateSession endpoint when available
          // For now, we'll trust the stored session
          // const isValid = await actor.validateSession(session.token);
          
          // Temporary: assume stored session is valid
          setSessionToken(session.token);
          setAccountId(session.accountId);
          setAuthStatus('authenticated');
        } catch (err) {
          console.error('Session validation failed:', err);
          sessionStorage.clear();
          setAuthStatus('unauthenticated');
        }
      }
    };

    if (authStatus === 'initializing') {
      initializeAuth();
    }
  }, [isReady, actor, authStatus]);

  const login = useCallback(async (identifier: string, password: string) => {
    setError(null);
    
    if (!actor) {
      throw new Error('Backend connection not ready');
    }

    try {
      // TODO: Call backend login endpoint when available
      // const response = await actor.login(identifier, passwordHash);
      
      // Temporary mock implementation
      throw new Error('Login endpoint not yet implemented in backend. Please use the backend authentication system once it is updated with custom auth support.');
      
      // When backend is ready, uncomment:
      /*
      const sessionData = {
        token: response.token,
        accountId: response.accountId,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };
      
      sessionStorage.save(sessionData);
      setSessionToken(sessionData.token);
      setAccountId(sessionData.accountId);
      setAuthStatus('authenticated');
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
      throw new Error('Backend connection not ready');
    }

    try {
      // TODO: Call backend register endpoint when available
      // const response = await actor.register(username, email, passwordHash);
      
      // Temporary mock implementation
      throw new Error('Registration endpoint not yet implemented in backend. Please use the backend authentication system once it is updated with custom auth support.');
      
      // When backend is ready, uncomment:
      /*
      const sessionData = {
        token: response.token,
        accountId: response.accountId,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };
      
      sessionStorage.save(sessionData);
      setSessionToken(sessionData.token);
      setAccountId(sessionData.accountId);
      setAuthStatus('authenticated');
      */
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
        // await actor.logout(sessionToken);
      } catch (err) {
        console.error('Logout error:', err);
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
