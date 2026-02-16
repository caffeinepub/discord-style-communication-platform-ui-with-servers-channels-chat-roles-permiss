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

  // Probe the backend with a lightweight health check
  const healthQuery = useQuery({
    queryKey: ['backend-health', actor ? 'available' : 'unavailable'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend actor not available');
      }
      try {
        const result = await actor.healthCheck();
        return result;
      } catch (error: any) {
        console.error('Health check failed:', error);
        throw new Error('Backend health check failed. The local replica may not be running.');
      }
    },
    enabled: actorState === 'ready' && !!actor,
    retry: false,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const retry = useCallback(() => {
    // Retry actor initialization first
    retryActor();
  }, [retryActor]);

  // Determine connection state
  let state: ConnectionState;
  let error: string | null = null;

  if (actorState === 'loading' || (actorState === 'ready' && healthQuery.isLoading)) {
    state = 'loading';
  } else if (actorState === 'error') {
    state = 'error';
    error = actorError || 'Failed to initialize backend connection';
  } else if (healthQuery.isError) {
    state = 'error';
    error = healthQuery.error?.message || 'Backend is not reachable';
  } else if (actorState === 'ready' && healthQuery.isSuccess) {
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
