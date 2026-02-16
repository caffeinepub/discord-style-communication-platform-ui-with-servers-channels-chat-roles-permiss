import { useActor } from './useActor';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

export type ConnectionState = 'loading' | 'ready' | 'error';

export interface BackendConnectionStatus {
  state: ConnectionState;
  error: string | null;
  retry: () => void;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

export function useBackendConnection(): BackendConnectionStatus {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Probe the backend with a lightweight health check
  const healthQuery = useQuery({
    queryKey: ['backend-health', retryTrigger],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available. Please ensure the replica is running.');
      }
      try {
        const result = await actor.healthCheck();
        return result;
      } catch (error: any) {
        throw new Error('Backend is not reachable. Please ensure the replica is running and try again.');
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 30000, // 30 seconds
  });

  const retry = useCallback(() => {
    // Invalidate actor query to force re-creation
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    // Trigger health check retry
    setRetryTrigger((prev) => prev + 1);
  }, [queryClient]);

  // Determine connection state
  let state: ConnectionState;
  let error: string | null = null;

  if (actorFetching || healthQuery.isLoading) {
    state = 'loading';
  } else if (!actor || healthQuery.isError) {
    state = 'error';
    error = healthQuery.error?.message || 'Backend connection not available. Please ensure the replica is running.';
  } else if (healthQuery.isSuccess) {
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
  };
}
