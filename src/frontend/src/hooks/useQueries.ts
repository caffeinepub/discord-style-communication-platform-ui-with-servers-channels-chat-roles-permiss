import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Server, ChannelCategory, Role, ServerMember, FriendRequest, UserStatus, Permission, TextChannelMessage, VoiceChannelPresence } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// Helper function to create friendly error messages
function getFriendlyErrorMessage(error: Error): string {
  const message = error.message;
  
  // Check for common backend connection errors
  if (message.includes('Actor not available') || message.includes('not available')) {
    return 'Backend connection not ready. Please wait or retry.';
  }
  
  if (message.includes('not reachable') || message.includes('connection')) {
    return 'Cannot reach backend. Please ensure the replica is running.';
  }
  
  // Return the original message for other errors
  return message;
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Backend connection not ready');
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
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['currentUsername'],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.getCallerUsername();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Backend connection not ready');
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

// Server Queries
export function useGetAllServers() {
  const { actor, isFetching } = useActor();

  return useQuery<Server[]>({
    queryKey: ['servers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetServer(serverId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Server | null>({
    queryKey: ['server', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return null;
      return actor.getServer(serverId);
    },
    enabled: !!actor && !isFetching && serverId !== null,
  });
}

export function useCreateServer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.createServer(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Server created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create server: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRenameServer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, newName }: { serverId: bigint; newName: string }) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.renameServer(serverId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Server renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to rename server: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useUpdateServerSettings() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Backend connection not ready');
      return actor.updateServerSettings(serverId, description, bannerUrl, iconUrl, communityMode);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Server settings updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useJoinServer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: bigint) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.joinServer(serverId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Joined server successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to join server: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useLeaveServer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: bigint) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.leaveServer(serverId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Left server successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave server: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useGetServerOrdering() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['serverOrdering'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServerOrdering();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetServerOrdering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ordering: bigint[]) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.setServerOrdering(ordering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverOrdering'] });
    },
  });
}

// Channel Queries
export function useGetCategories(serverId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ChannelCategory[]>({
    queryKey: ['categories', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return actor.getCategories(serverId);
    },
    enabled: !!actor && !isFetching && serverId !== null,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, categoryName }: { serverId: bigint; categoryName: string }) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.addCategoryToServer(serverId, categoryName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Category created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAddTextChannel() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Backend connection not ready');
      return actor.addTextChannel(serverId, categoryId, channelName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Text channel created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAddVoiceChannel() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Backend connection not ready');
      return actor.addVoiceChannel(serverId, categoryId, channelName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Voice channel created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create channel: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Role Queries
export function useGetRoles(serverId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Role[]>({
    queryKey: ['roles', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return actor.getRoles(serverId);
    },
    enabled: !!actor && !isFetching && serverId !== null,
  });
}

export function useAddRole() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Backend connection not ready');
      return actor.addRole(serverId, name, color, permissions);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Role created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useSetRolePermissions() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Backend connection not ready');
      return actor.setRolePermissions(serverId, roleId, permissions);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Permissions updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update permissions: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Member Queries
export function useGetServerMembers(serverId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ServerMember[]>({
    queryKey: ['serverMembers', serverId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null) return [];
      return actor.getServerMembers(serverId);
    },
    enabled: !!actor && !isFetching && serverId !== null,
  });
}

export function useAssignRoleToUser() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Backend connection not ready');
      return actor.assignRoleToUser(serverId, roleId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serverMembers', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Role assigned');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRemoveRoleFromUser() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Backend connection not ready');
      return actor.removeRoleFromUser(serverId, roleId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serverMembers', variables.serverId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['server', variables.serverId.toString()] });
      toast.success('Role removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// Friend Queries
export function useGetFriends() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriends();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFriendRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<FriendRequest[]>({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriendRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (to: Principal) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.sendFriendRequest(to);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Friend request sent');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send request: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (from: Principal) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.acceptFriendRequest(from);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Friend request accepted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to accept request: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useDeclineFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (from: Principal) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.declineFriendRequest(from);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Friend request declined');
    },
    onError: (error: Error) => {
      toast.error(`Failed to decline request: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useRemoveFriend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friend: Principal) => {
      if (!actor) throw new Error('Backend connection not ready');
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
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Backend connection not ready');
      return actor.blockUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('User blocked');
    },
    onError: (error: Error) => {
      toast.error(`Failed to block user: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

// User Status Queries
export function useGetUserStatus(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserStatus | null>({
    queryKey: ['userStatus', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserStatus(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useSetUserStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: UserStatus) => {
      if (!actor) throw new Error('Backend connection not ready');
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

// Text Channel Message Queries
export function useGetTextChannelMessages(serverId: bigint | null, textChannelId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<TextChannelMessage[]>({
    queryKey: ['textChannelMessages', serverId?.toString(), textChannelId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null || textChannelId === null) return [];
      return actor.getTextChannelMessages(serverId, textChannelId, null);
    },
    enabled: !!actor && !isFetching && serverId !== null && textChannelId !== null,
  });
}

export function useSendTextChannelMessage() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Backend connection not ready');
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

// Voice Channel Presence Queries
export function useGetVoiceChannelParticipants(serverId: bigint | null, voiceChannelId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<VoiceChannelPresence[]>({
    queryKey: ['voiceChannelParticipants', serverId?.toString(), voiceChannelId?.toString()],
    queryFn: async () => {
      if (!actor || serverId === null || voiceChannelId === null) return [];
      return actor.getVoiceChannelParticipants(serverId, voiceChannelId);
    },
    enabled: !!actor && !isFetching && serverId !== null && voiceChannelId !== null,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useJoinVoiceChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, voiceChannelId }: { serverId: bigint; voiceChannelId: bigint }) => {
      if (!actor) throw new Error('Backend connection not ready');
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
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, voiceChannelId }: { serverId: bigint; voiceChannelId: bigint }) => {
      if (!actor) throw new Error('Backend connection not ready');
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

// Discovery Queries
export function useDiscoverServers() {
  const { actor, isFetching } = useActor();

  return useQuery<Server[]>({
    queryKey: ['discoverServers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.discoverServers();
    },
    enabled: !!actor && !isFetching,
  });
}
