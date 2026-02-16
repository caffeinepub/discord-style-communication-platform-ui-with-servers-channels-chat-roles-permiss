import { useInternetIdentity } from './useInternetIdentity';
import { useState, useEffect, useCallback } from 'react';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

export type ActorState = 'loading' | 'ready' | 'error';

export interface SafeActorResult {
  actor: backendInterface | null;
  state: ActorState;
  error: string | null;
  retry: () => void;
}

export function useSafeActor(): SafeActorResult {
  const { identity, isInitializing } = useInternetIdentity();
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [state, setState] = useState<ActorState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const initializeActor = useCallback(async () => {
    setState('loading');
    setError(null);

    try {
      const isAuthenticated = !!identity;

      let newActor: backendInterface;

      if (!isAuthenticated) {
        // Create anonymous actor if not authenticated
        newActor = await createActorWithConfig();
      } else {
        // Create authenticated actor
        const actorOptions = {
          agentOptions: {
            identity
          }
        };
        newActor = await createActorWithConfig(actorOptions);

        // Attempt access control initialization (non-fatal)
        try {
          const adminToken = getSecretParameter('caffeineAdminToken') || '';
          if (typeof (newActor as any)._initializeAccessControlWithSecret === 'function') {
            await (newActor as any)._initializeAccessControlWithSecret(adminToken);
          }
        } catch (initError: any) {
          // Log diagnostic detail but don't fail actor creation
          console.warn('Access control initialization failed (non-fatal):', initError.message || initError);
          // This is expected if no admin token is provided or if already initialized
        }
      }

      // Verify that the actor has the required methods for authentication
      if (typeof newActor.register !== 'function' || typeof newActor.validateSession !== 'function') {
        throw new Error('Backend actor is missing required authentication methods. Please ensure the backend is deployed correctly.');
      }

      setActor(newActor);
      setState('ready');
    } catch (err: any) {
      console.error('Actor initialization failed:', err);
      const errorMessage = err.message || 'Failed to initialize backend connection';
      setError(errorMessage);
      setState('error');
      setActor(null);
    }
  }, [identity]);

  // Initialize actor when identity changes or retry is triggered
  useEffect(() => {
    if (!isInitializing) {
      initializeActor();
    }
  }, [identity?.getPrincipal().toString(), retryKey, isInitializing, initializeActor]);

  const retry = useCallback(() => {
    setRetryKey(prev => prev + 1);
  }, []);

  return {
    actor,
    state: isInitializing ? 'loading' : state,
    error,
    retry,
  };
}
