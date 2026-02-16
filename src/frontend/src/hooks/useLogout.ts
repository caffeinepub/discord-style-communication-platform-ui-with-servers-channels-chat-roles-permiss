import { useAuth } from '../auth/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export function useLogout() {
  const { logout: authLogout } = useAuth();
  const queryClient = useQueryClient();

  const logout = async () => {
    await authLogout();
    queryClient.clear();
  };

  return { logout };
}
