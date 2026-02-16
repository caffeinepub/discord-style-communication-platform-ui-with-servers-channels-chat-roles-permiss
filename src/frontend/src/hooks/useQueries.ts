import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendConnection } from './useBackendConnection';
import type { UserProfile, Server, ChannelCategory, Role, ServerMember, FriendRequest, UserStatus, Permission, TextChannelMessage, VoiceChannelPresence, AuditLogEntry, ServerMemberWithUsername, GetMembersWithRolesResponse } from '../backend';
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
      return actor.getCallerUserProfile();
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

export function useGetUserProfile(userId: Principal | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: isReady && !!actor && !!userId,
  });
}

export function useSaveCallerUserProfile() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.saveCallerUserProfile(profile);
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
      return actor.setUsername(username);
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

  return useQuery<Server[]>({
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

  return useQuery<Server[]>({
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
      return actor.getServer(serverId);
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
      return actor.createServer(name, description);
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
      return actor.renameServer(serverId, newName);
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
      return actor.joinServer(serverId);
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
      return actor.leaveServer(serverId);
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

// Channel Queries
export function useGetCategories(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ChannelCategory[]>({
    queryKey: ['categories', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return actor.getCategories(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useAddCategoryToServer() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, categoryName }: { serverId: bigint; categoryName: string }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.addCategoryToServer(serverId, categoryName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAddTextChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      categoryId,
      channelName,
    }: {
      serverId: bigint;
      categoryId: bigint;
      channelName: string;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.addTextChannel(serverId, categoryId, channelName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Text channel created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create text channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAddVoiceChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      categoryId,
      channelName,
    }: {
      serverId: bigint;
      categoryId: bigint;
      channelName: string;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.addVoiceChannel(serverId, categoryId, channelName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Voice channel created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create voice channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useMoveChannelToCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      sourceCategoryId,
      targetCategoryId,
      channelId,
      isTextChannel,
      position,
    }: {
      serverId: bigint;
      sourceCategoryId: bigint;
      targetCategoryId: bigint;
      channelId: bigint;
      isTextChannel: boolean;
      position: number | null;
    }) => {
      // Note: This is a client-side only operation since the backend doesn't support moving channels
      // In a real implementation, this would call a backend method
      throw new Error('Moving channels between categories is not yet implemented in the backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
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
      return actor.getRoles(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useGetServerRoles(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<Role[]>({
    queryKey: ['serverRoles', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return actor.getServerRoles(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useAddRole() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      name,
      color,
      permissions,
    }: {
      serverId: bigint;
      name: string;
      color: string;
      permissions: Permission[];
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.addRole(serverId, name, color, permissions);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['serverRoles', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
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
    mutationFn: async ({
      serverId,
      roleId,
      permissions,
    }: {
      serverId: bigint;
      roleId: bigint;
      permissions: Permission[];
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.setRolePermissions(serverId, roleId, permissions);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['serverRoles', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Role permissions updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update role permissions: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAssignRoleToUser() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      roleId,
      userId,
    }: {
      serverId: bigint;
      roleId: bigint;
      userId: Principal;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.assignRoleToUser(serverId, roleId, userId);
    },
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['serverMembers', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['serverMembersWithUsernames', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['serverMembersWithRoles', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['memberDisplayColor', variables.serverId.toString(), variables.userId.toString()] });
      toast.success('Role assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRemoveRoleFromUser() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      roleId,
      userId,
    }: {
      serverId: bigint;
      roleId: bigint;
      userId: Principal;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.removeRoleFromUser(serverId, roleId, userId);
    },
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['serverMembers', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['serverMembersWithUsernames', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['serverMembersWithRoles', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['memberDisplayColor', variables.serverId.toString(), variables.userId.toString()] });
      toast.success('Role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Server Members Queries
export function useGetServerMembers(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<ServerMember[]>({
    queryKey: ['serverMembers', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return actor.getServerMembers(serverId);
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
      return actor.getServerMembersWithUsernames(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useGetServerMembersWithRoles(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<GetMembersWithRolesResponse>({
    queryKey: ['serverMembersWithRoles', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) {
        return { members: [], roles: [] };
      }
      return actor.getServerMembersWithRoles(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}

export function useGetMemberDisplayColor(serverId: bigint | null, userId: Principal | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<string | null>({
    queryKey: ['memberDisplayColor', serverId?.toString(), userId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null || userId === null) return null;
      return actor.getMemberDisplayColor(serverId, userId);
    },
    enabled: isReady && !!actor && serverId !== null && userId !== null,
  });
}

// Text Channel Message Queries
export function useGetTextChannelMessages(serverId: bigint | null, textChannelId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<TextChannelMessage[]>({
    queryKey: ['textChannelMessages', serverId?.toString(), textChannelId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null || textChannelId === null) return [];
      return actor.getTextChannelMessages(serverId, textChannelId, null);
    },
    enabled: isReady && !!actor && serverId !== null && textChannelId !== null,
  });
}

export function useSendTextChannelMessage() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serverId,
      textChannelId,
      content,
    }: {
      serverId: bigint;
      textChannelId: bigint;
      content: string;
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.sendTextChannelMessage(serverId, textChannelId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['textChannelMessages', variables.serverId.toString(), variables.textChannelId.toString()],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Voice Channel Queries
export function useGetVoiceChannelParticipants(serverId: bigint | null, voiceChannelId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<VoiceChannelPresence[]>({
    queryKey: ['voiceChannelParticipants', serverId?.toString(), voiceChannelId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null || voiceChannelId === null) return [];
      return actor.getVoiceChannelParticipants(serverId, voiceChannelId);
    },
    enabled: isReady && !!actor && serverId !== null && voiceChannelId !== null,
  });
}

export function useJoinVoiceChannel() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, voiceChannelId }: { serverId: bigint; voiceChannelId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.joinVoiceChannel(serverId, voiceChannelId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['voiceChannelParticipants', variables.serverId.toString(), variables.voiceChannelId.toString()],
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
    mutationFn: async ({ serverId, voiceChannelId }: { serverId: bigint; voiceChannelId: bigint }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.leaveVoiceChannel(serverId, voiceChannelId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['voiceChannelParticipants', variables.serverId.toString(), variables.voiceChannelId.toString()],
      });
      toast.success('Left voice channel');
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave voice channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Friend System Queries
export function useGetFriendRequests() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<FriendRequest[]>({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriendRequests();
    },
    enabled: isReady && !!actor,
  });
}

export function useGetFriends() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<Principal[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriends();
    },
    enabled: isReady && !!actor,
  });
}

export function useSendFriendRequest() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (to: Principal) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.sendFriendRequest(to);
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
    mutationFn: async (from: Principal) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.acceptFriendRequest(from);
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
    mutationFn: async (from: Principal) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.declineFriendRequest(from);
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
    mutationFn: async (friend: Principal) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.removeFriend(friend);
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

export function useBlockUser() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.blockUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('User blocked');
    },
    onError: (error: Error) => {
      toast.error(`Failed to block user: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// User Status Queries
export function useGetUserStatus(userId: Principal | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<UserStatus | null>({
    queryKey: ['userStatus', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserStatus(userId);
    },
    enabled: isReady && !!actor && !!userId,
  });
}

export function useSetUserStatus() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: UserStatus) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.setUserStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStatus'] });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Server Ordering
export function useGetServerOrdering() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<bigint[]>({
    queryKey: ['serverOrdering'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServerOrdering();
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
      return actor.setServerOrdering(ordering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverOrdering'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update server ordering: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Category Channel Ordering
export function useGetCategoryChannelOrdering(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<{
    categoryOrder: bigint[];
    textChannelOrder: [bigint, bigint[]][];
    voiceChannelOrder: [bigint, bigint[]][];
  } | null>({
    queryKey: ['categoryChannelOrdering', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return null;
      return actor.getCategoryChannelOrdering(serverId);
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
      categoryOrder,
      textChannelOrderEntries,
      voiceChannelOrderEntries,
    }: {
      serverId: bigint;
      categoryOrder: bigint[];
      textChannelOrderEntries: [bigint, bigint[]][];
      voiceChannelOrderEntries: [bigint, bigint[]][];
    }) => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.updateCategoryChannelOrdering(
        serverId,
        categoryOrder,
        textChannelOrderEntries,
        voiceChannelOrderEntries
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categoryChannelOrdering', variables.serverId.toString()] });
      toast.success('Channel ordering updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update channel ordering: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Audit Log Query
export function useGetServerAuditLog(serverId: bigint | null) {
  const { actor, isReady } = useBackendConnection();

  return useQuery<AuditLogEntry[]>({
    queryKey: ['serverAuditLog', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return actor.getServerAuditLog(serverId);
    },
    enabled: isReady && !!actor && serverId !== null,
  });
}
