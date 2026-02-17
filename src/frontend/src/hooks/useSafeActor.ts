import { useEffect, useState } from 'react';
import { useActor } from './useActor';
import type { backendInterface } from '../backend';

export type ActorState = 'loading' | 'ready' | 'error';

export interface SafeActorResult {
  actor: backendInterface | null;
  isFetching: boolean;
  error: string | null;
  state: ActorState;
  retry: () => void;
}

/**
 * Safe actor initialization hook with runtime verification
 * Ensures required authentication methods exist on the backend actor
 */
export function useSafeActor(): SafeActorResult {
  const { actor: rawActor, isFetching } = useActor();
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isFetching) {
      setActor(null);
      setError(null);
      return;
    }

    if (!rawActor) {
      setActor(null);
      setError('Actor not available');
      return;
    }

    // Verify that required methods exist
    // Note: This backend uses a simplified auth model
    // We only verify the register method exists
    try {
      const newActor = rawActor as any;
      
      // Check if register method exists (required for authentication)
      if (typeof newActor.register !== 'function') {
        const errorMsg = 'Backend actor missing required authentication methods. Expected: register';
        console.error(errorMsg, {
          hasRegister: typeof newActor.register === 'function',
          availableMethods: Object.keys(newActor).filter(key => typeof newActor[key] === 'function')
        });
        setError(errorMsg);
        setActor(null);
        return;
      }

      // Actor is valid
      setActor(rawActor);
      setError(null);
    } catch (err: any) {
      console.error('Error verifying actor methods:', err);
      setError(err.message || 'Failed to verify actor');
      setActor(null);
    }
  }, [rawActor, isFetching, retryCount]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  let state: ActorState;
  if (isFetching) {
    state = 'loading';
  } else if (error) {
    state = 'error';
  } else if (actor) {
    state = 'ready';
  } else {
    state = 'loading';
  }

  return {
    actor,
    isFetching,
    error,
    state,
    retry,
  };
}
