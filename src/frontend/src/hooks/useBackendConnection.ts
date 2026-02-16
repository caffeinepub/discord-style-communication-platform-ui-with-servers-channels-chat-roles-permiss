import { useSafeActor } from './useSafeActor';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export type ConnectionState = 'loading' | 'ready' | 'error';

export interface BackendConnectionStatus {
  state: ConnectionState;
  error: string | null;
  retry: () => void;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
  actor: any | null;
}

export function useBackendConnection(): BackendConnectionStatus {
  const { actor, state: actorState, error: actorError, retry: retryActor } = useSafeActor();

  // Simple check: if actor is ready, connection is ready
  // No health check since backend doesn't have healthCheck method
  const retry = useCallback(() => {
    retryActor();
  }, [retryActor]);

  // Determine connection state
  let state: ConnectionState;
  let error: string | null = null;

  if (actorState === 'loading') {
    state = 'loading';
  } else if (actorState === 'error') {
    state = 'error';
    error = actorError || 'Failed to initialize backend connection';
  } else if (actorState === 'ready' && actor) {
    state = 'ready';
  } else {
    state = 'loading';
  }

  return {
    state,
    error,
    retry,
    isLoading: state === 'loading',
    isReady: state === 'ready',
    isError: state === 'error',
    actor: state === 'ready' ? actor : null,
  };
}
