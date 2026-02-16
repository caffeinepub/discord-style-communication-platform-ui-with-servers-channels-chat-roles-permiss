import { useBackendConnection } from './useBackendConnection';

export interface BackendActionGuard {
  disabled: boolean;
  reason: string | null;
}

export function useBackendActionGuard(): BackendActionGuard {
  const { state, error } = useBackendConnection();

  if (state === 'loading') {
    return {
      disabled: true,
      reason: 'Connecting to backend...',
    };
  }

  if (state === 'error') {
    return {
      disabled: true,
      reason: error || 'Backend connection not ready',
    };
  }

  return {
    disabled: false,
    reason: null,
  };
}
