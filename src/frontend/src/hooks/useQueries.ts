import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendConnection } from './useBackendConnection';
import type { UserProfile, CreateServerPayload, Server as BackendServer } from '../backend';
import type { 
  Server, 
  ChannelCategory, 
  Role, 
  ServerMember, 
  FriendRequest, 
  UserStatus, 
  Permission, 
  TextChannelMessage, 
  VoiceChannelPresence, 
  AuditLogEntry, 
  ServerMemberWithUsername, 
  GetMembersWithRolesResponse, 
  ServerOrdering, 
  CategoryLevelOrdering 
} from '../types/backend-extended';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// Helper function to create friendly error messages
function getFriendlyErrorMessage(error: Error): string {
  const message = error.message;
  
  // Check for common backend connection errors
  if (message.includes('Actor not available') || message.includes('not available') || message.includes('not ready')) {
    return 'Backend connection not ready. Please wait or press Retry.';
  }
  
  if (message.includes('not reachable') || message.includes('connection') || message.includes('replica')) {
    return 'Cannot reach backend. Please ensure the local replica is running.';
  }
  
  // Check for permission errors
  if (message.includes('Unauthorized') || message.includes('permission')) {
    return message; // Return the original message for permission errors
  }
  
  // Return the original message for other errors
  return message;
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isReady } = useBackendConnection();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not ready');
      return (actor as any).getCallerUserProfile();
    },
    enabled: isReady && !!actor,
    retry: false,
  });

  return {
    ...query,
    isLoading: !isReady || query.isLoading,
    isFetched: isReady && query.isFetched,
  };
}

export function useGetUserProfile(username: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      if (!actor || !username) return null;
      return actor.getUserProfile(username);
    },
    enabled: isReady && !!actor && !!username,
  });
}

export function useGetUserProfileByUsername(username: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      if (!actor || !username) return null;
      return actor.getUserProfile(username);
    },
    enabled: isReady && !!actor && !!username,
  });
}

export function useSaveCallerUserProfile() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Username Queries
export function useGetCallerUsername() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string | null>({
    queryKey: ['currentUsername'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.getCallerUsername();
    },
    enabled: isReady && !!actor,
  });
}

export function useGetUsernameForUser(userId: Principal | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string | null>({
    queryKey: ['username', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUsernameForUser(userId);
    },
    enabled: isReady && !!actor && !!userId,
  });
}

export function useSetUsername() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).setUsername(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUsername'] });
      toast.success('Username updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update username: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Account Email Query
export function useGetCallerAccountEmail() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string | null>({
    queryKey: ['currentAccountEmail'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not ready');
      return (actor as any).getCallerAccountEmail();
    },
    enabled: isReady && !!actor,
    retry: false,
  });
}

// Admin Check Query
export function useIsCallerAdmin() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: isReady && !!actor,
  });
}

// Server Queries
export function useGetAllServers() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<BackendServer[]>({
    queryKey: ['servers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServers();
    },
    enabled: isReady && !!actor,
  });
}

export function useDiscoverServers() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<BackendServer[]>({
    queryKey: ['discoverServers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServers();
    },
    enabled: isReady && !!actor,
  });
}

export function useGetServer(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<Server | null>({
    queryKey: ['server', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return null;
      return (actor as any).getServer(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useCreateServer() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      
      const payload: CreateServerPayload = {
        name: name,
        description: description,
        isPublic: false,
        iconURL: '',
        bannerURL: '',
      };
      
      return actor.createServer(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['discoverServers'] });
      toast.success('Server created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create server: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRenameServer() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, newName }: { serverId: bigint; newName: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).renameServer(serverId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['discoverServers'] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Server renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to rename server: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useUpdateServerSettings() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      description,
      bannerUrl,
      iconUrl,
      communityMode,
    }: {
      serverId: bigint;
      description: string;
      bannerUrl: string;
      iconUrl: string;
      communityMode: boolean;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      
      // Get current server data
      const server = await (actor as any).getServer(serverId);
      
      // Update server by renaming (keeps name the same) - this is a workaround since there's no direct update method
      // We'll need to update individual fields through available methods
      // For now, we can only update what the backend supports
      
      // Note: The backend doesn't have a direct updateServerSettings method
      // This is a placeholder that would need backend support
      throw new Error('Server settings update not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['discoverServers'] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Server settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update server settings: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useJoinServer() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: bigint) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).joinServer(serverId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['discoverServers'] });
      toast.success('Joined server successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to join server: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useLeaveServer() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: bigint) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).leaveServer(serverId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['discoverServers'] });
      toast.success('Left server successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave server: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Server Ordering Queries
export function useGetServerOrdering() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<bigint[]>({
    queryKey: ['serverOrdering'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getServerOrdering();
    },
    enabled: isReady && !!actor,
  });
}

export function useSetServerOrdering() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ordering: bigint[]) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).setServerOrdering(ordering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverOrdering'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update server ordering: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Category and Channel Ordering Queries
export function useGetCategoryChannelOrdering(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ServerOrdering | null>({
    queryKey: ['categoryChannelOrdering', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return null;
      return (actor as any).getCategoryChannelOrdering(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useUpdateCategoryChannelOrdering() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      ordering,
    }: {
      serverId: bigint;
      ordering: ServerOrdering;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).setCategoryChannelOrdering(serverId, ordering);
    },
    onMutate: async ({ serverId, ordering }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['categoryChannelOrdering', serverId.toString()] });

      // Snapshot the previous value
      const previousOrdering = queryClient.getQueryData<ServerOrdering | null>(['categoryChannelOrdering', serverId.toString()]);

      // Optimistically update to the new value
      queryClient.setQueryData(['categoryChannelOrdering', serverId.toString()], ordering);

      // Return a context object with the snapshotted value
      return { previousOrdering, serverId };
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousOrdering !== undefined) {
        queryClient.setQueryData(['categoryChannelOrdering', context.serverId.toString()], context.previousOrdering);
      }
      toast.error(`Failed to update ordering: ${getFriendlyErrorMessage(error)}`);
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['categoryChannelOrdering', variables.serverId.toString()] });
    },
  });
}

// Category Queries
export function useGetCategories(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ChannelCategory[]>({
    queryKey: ['categories', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return (actor as any).getCategories(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useCreateCategory() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, name }: { serverId: bigint; name: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).createCategory(serverId, name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRenameCategory() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, categoryId, newName }: { serverId: bigint; categoryId: bigint; newName: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).renameCategory(serverId, categoryId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Category renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to rename category: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useDeleteCategory() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, categoryId }: { serverId: bigint; categoryId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).deleteCategory(serverId, categoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Channel Queries
export function useAddTextChannelToCategory() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, categoryId, name }: { serverId: bigint; categoryId: bigint; name: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).addTextChannelToCategory(serverId, categoryId, name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Text channel created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create text channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAddVoiceChannelToCategory() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, categoryId, name }: { serverId: bigint; categoryId: bigint; name: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).addVoiceChannelToCategory(serverId, categoryId, name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Voice channel created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create voice channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRenameTextChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId, newName }: { serverId: bigint; channelId: bigint; newName: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).renameTextChannel(serverId, channelId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Channel renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to rename channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRenameVoiceChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId, newName }: { serverId: bigint; channelId: bigint; newName: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).renameVoiceChannel(serverId, channelId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Channel renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to rename channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useDeleteTextChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId }: { serverId: bigint; channelId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).deleteTextChannel(serverId, channelId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Channel deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useDeleteVoiceChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId }: { serverId: bigint; channelId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).deleteVoiceChannel(serverId, channelId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Channel deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useMoveTextChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId, newCategoryId }: { serverId: bigint; channelId: bigint; newCategoryId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).moveTextChannel(serverId, channelId, newCategoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Channel moved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to move channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useMoveVoiceChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId, newCategoryId }: { serverId: bigint; channelId: bigint; newCategoryId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).moveVoiceChannel(serverId, channelId, newCategoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      toast.success('Channel moved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to move channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Role Queries
export function useGetRoles(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<Role[]>({
    queryKey: ['roles', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return (actor as any).getRoles(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useAddRoleToServer() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, name, color, permissions }: { serverId: bigint; name: string; color: string; permissions: Permission[] }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).addRoleToServer(serverId, name, color, permissions);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.serverId.toString()] });
      toast.success('Role created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAssignRoleToMember() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, userId, roleId }: { serverId: bigint; userId: Principal; roleId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).assignRoleToMember(serverId, userId, roleId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serverMembers', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['membersWithRoles', variables.serverId.toString()] });
      toast.success('Role assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRemoveRoleFromMember() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, userId, roleId }: { serverId: bigint; userId: Principal; roleId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).removeRoleFromMember(serverId, userId, roleId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serverMembers', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['membersWithRoles', variables.serverId.toString()] });
      toast.success('Role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useGetMemberRoles(serverId: bigint | null, userId: Principal | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<bigint[]>({
    queryKey: ['memberRoles', serverId?.toString(), userId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null || userId === null) return [];
      return (actor as any).getMemberRoles(serverId, userId);
    },
    enabled: isReady && !!actor && serverId !== null && userId !== null,
  });
}

// Server Member Queries
export function useGetServerMembers(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ServerMember[]>({
    queryKey: ['serverMembers', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return (actor as any).getServerMembers(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useGetServerMembersWithUsernames(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ServerMemberWithUsername[]>({
    queryKey: ['serverMembersWithUsernames', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return (actor as any).getServerMembersWithUsernames(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useGetMembersWithRoles(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<GetMembersWithRolesResponse>({
    queryKey: ['membersWithRoles', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return { members: [] };
      return (actor as any).getMembersWithRoles(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

// Friend Queries
export function useGetFriends() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getFriends();
    },
    enabled: isReady && !!actor,
  });
}

export function useGetFriendRequests() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<FriendRequest[]>({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getFriendRequests();
    },
    enabled: isReady && !!actor,
  });
}

export function useSendFriendRequest() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).sendFriendRequest(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Friend request sent');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send friend request: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).acceptFriendRequest(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Friend request accepted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to accept friend request: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRejectFriendRequest() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).rejectFriendRequest(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Friend request rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject friend request: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRemoveFriend() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).removeFriend(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Friend removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove friend: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// User Status Queries
export function useGetUserStatus(username: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<UserStatus>({
    queryKey: ['userStatus', username],
    queryFn: async () => {
      if (!actor || !username) return { __kind__: 'offline' };
      return (actor as any).getUserStatus(username);
    },
    enabled: isReady && !!actor && !!username,
  });
}

export function useSetUserStatus() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: UserStatus) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).setUserStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStatus'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Text Channel Message Queries
export function useGetTextChannelMessages(serverId: bigint | null, channelId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<TextChannelMessage[]>({
    queryKey: ['textChannelMessages', serverId?.toString(), channelId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null || channelId === null) return [];
      return (actor as any).getTextChannelMessages(serverId, channelId);
    },
    enabled: isReady && !!actor && serverId !== null && channelId !== null,
  });
}

export function useSendTextChannelMessage() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId, content }: { serverId: bigint; channelId: bigint; content: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).sendTextChannelMessage(serverId, channelId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['textChannelMessages', variables.serverId.toString(), variables.channelId.toString()] 
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Voice Channel Presence Queries
export function useGetVoiceChannelPresences(serverId: bigint | null, channelId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<VoiceChannelPresence[]>({
    queryKey: ['voiceChannelPresences', serverId?.toString(), channelId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null || channelId === null) return [];
      return (actor as any).getVoiceChannelPresences(serverId, channelId);
    },
    enabled: isReady && !!actor && serverId !== null && channelId !== null,
  });
}

export function useJoinVoiceChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId }: { serverId: bigint; channelId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).joinVoiceChannel(serverId, channelId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['voiceChannelPresences', variables.serverId.toString(), variables.channelId.toString()] 
      });
      toast.success('Joined voice channel');
    },
    onError: (error: Error) => {
      toast.error(`Failed to join voice channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useLeaveVoiceChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId }: { serverId: bigint; channelId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).leaveVoiceChannel(serverId, channelId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['voiceChannelPresences', variables.serverId.toString(), variables.channelId.toString()] 
      });
      toast.success('Left voice channel');
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave voice channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Audit Log Queries
export function useGetAuditLog(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<AuditLogEntry[]>({
    queryKey: ['auditLog', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return (actor as any).getAuditLog(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}
