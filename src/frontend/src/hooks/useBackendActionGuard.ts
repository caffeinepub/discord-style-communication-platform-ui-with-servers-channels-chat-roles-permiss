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
      reason: null,
    };
  }

  if (state === 'error') {
    return {
      disabled: true,
      reason: error || 'Backend connection error. Please retry.',
    };
  }

  return {
    disabled: false,
    reason: null,
  };
}
