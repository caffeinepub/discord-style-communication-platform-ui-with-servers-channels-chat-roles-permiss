import { useAuthContext } from './AuthProvider';

export function useAuth() {
  return useAuthContext();
}

// Re-export useAuthContext for direct usage
export { useAuthContext };
