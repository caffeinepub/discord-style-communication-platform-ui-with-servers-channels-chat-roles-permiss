import { useSafeActor } from './useSafeActor';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { withTimeout } from '../utils/withTimeout';

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

const HEALTH_CHECK_TIMEOUT_MS = 10000; // 10 seconds

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
        // Wrap health check with timeout to prevent hanging
        const result = await withTimeout(
          actor.healthCheck(),
          HEALTH_CHECK_TIMEOUT_MS,
          'Backend health check timed out. The local replica may not be running or is unresponsive.'
        );
        return result;
      } catch (error: any) {
        console.error('Health check failed:', error);
        throw new Error(
          error.message || 'Backend health check failed. The local replica may not be running.'
        );
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
    // Force refetch health check after actor retry
    if (healthQuery.isError) {
      healthQuery.refetch();
    }
  }, [retryActor, healthQuery]);

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
