import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout: authLogout } = useAuth();

  const logout = async () => {
    // Call auth provider logout (which clears session storage and calls backend logout if available)
    await authLogout();
    
    // Clear all React Query cache to ensure no stale data is shown after logout
    queryClient.clear();
  };

  return { logout };
}
