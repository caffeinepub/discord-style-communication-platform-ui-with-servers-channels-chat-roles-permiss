import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export function useLogout() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const logout = async () => {
    await clear();
    queryClient.clear();
  };

  return { logout };
}
