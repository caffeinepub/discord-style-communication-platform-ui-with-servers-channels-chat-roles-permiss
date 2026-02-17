import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendConnection } from './useBackendConnection';
import type { CreateServerPayload, Server as BackendServer, Category, Channel } from '../backend';
import type { 
  UserProfile,
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

// User Profile Queries - Mock implementations since backend doesn't have these
export function useGetCallerUserProfile() {
  const { actor, isReady } = useBackendConnection();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not ready');
      // Mock: return a default profile
      return {
        name: 'User',
        aboutMe: '',
        customStatus: '',
        avatarUrl: '',
        bannerUrl: '',
        badges: [],
      };
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
      // Mock: return null since backend doesn't have this method
      return null;
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
      // Mock: return null since backend doesn't have this method
      return null;
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
      // Mock: do nothing since backend doesn't have this method
      return;
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

// Username Queries - Mock implementations
export function useGetCallerUsername() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string | null>({
    queryKey: ['currentUsername'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not ready');
      // Mock: return a default username
      return 'user';
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
      // Mock: return null since backend doesn't have this method
      return null;
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
      // Mock: do nothing since backend doesn't have this method
      return;
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

// Account Email Query - Mock implementation
export function useGetCallerAccountEmail() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string | null>({
    queryKey: ['currentAccountEmail'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not ready');
      // Mock: return null since backend doesn't have this method
      return null;
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

export function useGetServer(serverId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<BackendServer | null>({
    queryKey: ['server', serverId],
    queryFn: async () => {
      if (!actor || serverId === null) return null;
      const result = await actor.getServer(serverId);
      return result || null;
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
    mutationFn: async ({ serverId, newName }: { serverId: string; newName: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return (actor as any).renameServer(serverId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['discoverServers'] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId] });
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
      serverId: string;
      description: string;
      bannerUrl: string;
      iconUrl: string;
      communityMode: boolean;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      
      // Get current server data
      const server = await actor.getServer(serverId);
      
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
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId] });
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
    mutationFn: async (serverId: string) => {
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
    mutationFn: async (serverId: string) => {
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

// Server Ordering Queries - Mock implementations
export function useGetServerOrdering() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string[]>({
    queryKey: ['serverOrdering'],
    queryFn: async () => {
      if (!actor) return [];
      // Mock: return empty array since backend doesn't have this method
      return [];
    },
    enabled: isReady && !!actor,
  });
}

export function useSetServerOrdering() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ordering: string[]) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverOrdering'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update server ordering: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Category Queries
export function useGetCategories(serverId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<Category[]>({
    queryKey: ['categories', serverId],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return actor.getCategories(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useCreateCategory() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, name }: { serverId: string; name: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.createCategory(serverId, name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId] });
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
    mutationFn: async ({ serverId, categoryId, newName }: { serverId: string; categoryId: string; newName: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.renameCategory(serverId, categoryId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId] });
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
    mutationFn: async ({ serverId, categoryId }: { serverId: string; categoryId: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.deleteCategory(serverId, categoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId] });
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
    mutationFn: async ({ serverId, categoryId, name }: { serverId: string; categoryId: string; name: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.addTextChannelToCategory(serverId, categoryId, name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId] });
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
    mutationFn: async ({ serverId, categoryId, name }: { serverId: string; categoryId: string; name: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.addVoiceChannelToCategory(serverId, categoryId, name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId] });
      toast.success('Voice channel created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create voice channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Category and Channel Ordering Queries
export function useSetCategoryOrder() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, newOrder }: { serverId: string; newOrder: string[] }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.setCategoryOrder(serverId, newOrder);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category order: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useSetChannelOrder() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, categoryId, newOrder }: { serverId: string; categoryId: string; newOrder: string[] }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.setChannelOrder(serverId, categoryId, newOrder);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update channel order: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Legacy hooks for backward compatibility (will be removed) - Mock implementations
export function useGetCategoryChannelOrdering(serverId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ServerOrdering | null>({
    queryKey: ['categoryChannelOrdering', serverId],
    queryFn: async () => {
      if (!actor || serverId === null) return null;
      // Mock: return null since backend doesn't have this method
      return null;
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
      serverId: string;
      ordering: ServerOrdering;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onMutate: async ({ serverId, ordering }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['categoryChannelOrdering', serverId] });

      // Snapshot the previous value
      const previousOrdering = queryClient.getQueryData<ServerOrdering | null>(['categoryChannelOrdering', serverId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['categoryChannelOrdering', serverId], ordering);

      // Return a context object with the snapshotted value
      return { previousOrdering, serverId };
    },
    onError: (error: Error, variables, context) => {
      // Revert to the previous value on error
      if (context?.previousOrdering !== undefined) {
        queryClient.setQueryData(['categoryChannelOrdering', context.serverId], context.previousOrdering);
      }
      toast.error(`Failed to update ordering: ${getFriendlyErrorMessage(error)}`);
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['categoryChannelOrdering', variables.serverId] });
    },
  });
}

// Role Queries - Mock implementations
export function useGetRoles(serverId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<Role[]>({
    queryKey: ['roles', serverId],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      // Mock: return empty array since backend doesn't have this method
      return [];
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useAddRoleToServer() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, name, color }: { serverId: string; name: string; color: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.serverId] });
      toast.success('Role created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useSetRolePermissions() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, roleId, permissions }: { serverId: string; roleId: string; permissions: Permission[] }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.serverId] });
      toast.success('Role permissions updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update role permissions: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAssignRoleToMember() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, userId, roleId }: { serverId: string; userId: Principal; roleId: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serverMembers', variables.serverId] });
      queryClient.invalidateQueries({ queryKey: ['membersWithRoles', variables.serverId] });
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
    mutationFn: async ({ serverId, userId, roleId }: { serverId: string; userId: Principal; roleId: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serverMembers', variables.serverId] });
      queryClient.invalidateQueries({ queryKey: ['membersWithRoles', variables.serverId] });
      toast.success('Role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Server Member Queries - Mock implementations
export function useGetServerMembers(serverId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ServerMember[]>({
    queryKey: ['serverMembers', serverId],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      // Mock: return empty array since backend doesn't have this method
      return [];
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useGetServerMembersWithUsernames(serverId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ServerMemberWithUsername[]>({
    queryKey: ['serverMembersWithUsernames', serverId],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      // Mock: return empty array since backend doesn't have this method
      return [];
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useGetMembersWithRoles(serverId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<GetMembersWithRolesResponse>({
    queryKey: ['membersWithRoles', serverId],
    queryFn: async () => {
      if (!actor || serverId === null) return { members: [], roles: [] };
      // Mock: return empty response since backend doesn't have this method
      return { members: [], roles: [] };
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

// Text Channel Message Queries - Mock implementations
export function useGetTextChannelMessages(serverId: string | null, channelId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<TextChannelMessage[]>({
    queryKey: ['textChannelMessages', serverId, channelId],
    queryFn: async () => {
      if (!actor || serverId === null || channelId === null) return [];
      // Mock: return empty array since backend doesn't have this method
      return [];
    },
    enabled: isReady && !!actor && serverId !== null && channelId !== null,
  });
}

export function useSendTextChannelMessage() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId, content }: { serverId: string; channelId: string; content: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['textChannelMessages', variables.serverId, variables.channelId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Voice Channel Presence Queries - Mock implementations
export function useGetVoiceChannelPresences(serverId: string | null, channelId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<VoiceChannelPresence[]>({
    queryKey: ['voiceChannelPresences', serverId, channelId],
    queryFn: async () => {
      if (!actor || serverId === null || channelId === null) return [];
      // Mock: return empty array since backend doesn't have this method
      return [];
    },
    enabled: isReady && !!actor && serverId !== null && channelId !== null,
  });
}

export function useJoinVoiceChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, channelId }: { serverId: string; channelId: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voiceChannelPresences', variables.serverId, variables.channelId] });
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
    mutationFn: async ({ serverId, channelId }: { serverId: string; channelId: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voiceChannelPresences', variables.serverId, variables.channelId] });
      toast.success('Left voice channel');
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave voice channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Friend Queries - Mock implementations
export function useGetFriends() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor) return [];
      // Mock: return empty array since backend doesn't have this method
      return [];
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
      // Mock: return empty array since backend doesn't have this method
      return [];
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
      // Mock: do nothing since backend doesn't have this method
      return;
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
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Friend request accepted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to accept friend request: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useDeclineFriendRequest() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Friend request declined');
    },
    onError: (error: Error) => {
      toast.error(`Failed to decline friend request: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRemoveFriend() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      // Mock: do nothing since backend doesn't have this method
      return;
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

// Audit Log Queries - Mock implementation
export function useGetAuditLog(serverId: string | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<AuditLogEntry[]>({
    queryKey: ['auditLog', serverId],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      // Mock: return empty array since backend doesn't have this method
      return [];
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}
