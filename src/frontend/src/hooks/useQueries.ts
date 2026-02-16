import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendConnection } from './useBackendConnection';
import type { UserProfile, FriendRequest, UserStatus, AdminVerificationData } from '../backend';
import type {
  Server,
  ChannelCategory,
  Role,
  ServerMember,
  Permission,
  TextChannelMessage,
  VoiceChannelPresence,
  AuditLogEntry,
  ServerMemberWithUsername,
  GetMembersWithRolesResponse,
  ServerOrdering,
  CategoryLevelOrdering,
} from '../types/local';
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

// Admin Replica Reset Mutations
export function useAdminWipeReplicaData() {
  const { actor, isReady } = useBackendConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!isReady || !actor) throw new Error('Backend is not ready yet. Please wait or press Retry.');
      return actor.adminWipeReplicaData();
    },
    onSuccess: () => {
      // Clear all cached queries to reflect empty state
      queryClient.clear();
      toast.success('Replica data wiped successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to wipe replica data: ${getFriendlyErrorMessage(error)}`);
    },
  });
}

export function useAdminCheckWipeResult() {
  const { actor, isReady } = useBackendConnection();

  return useQuery<AdminVerificationData | null>({
    queryKey: ['adminWipeVerification'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminCheckWipeResult();
    },
    enabled: false, // Manual trigger only
  });
}

// Friend Queries
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

// Stub functions for features not yet implemented in backend
// These return empty data to prevent runtime errors

export function useGetAllServers() {
  return useQuery<Server[]>({
    queryKey: ['servers'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useDiscoverServers() {
  return useQuery<Server[]>({
    queryKey: ['discoverServers'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetServer(serverId: bigint | null) {
  return useQuery<Server | null>({
    queryKey: ['server', serverId?.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useCreateServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      throw new Error('Server functionality not yet implemented in backend');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create server: ${error.message}`);
    },
  });
}

export function useRenameServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serverId, newName }: { serverId: bigint; newName: string }) => {
      throw new Error('Server functionality not yet implemented in backend');
    },
    onError: (error: Error) => {
      toast.error(`Failed to rename server: ${error.message}`);
    },
  });
}

export function useUpdateServerSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Server functionality not yet implemented in backend');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update server settings: ${error.message}`);
    },
  });
}

export function useJoinServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serverId: bigint) => {
      throw new Error('Server functionality not yet implemented in backend');
    },
    onError: (error: Error) => {
      toast.error(`Failed to join server: ${error.message}`);
    },
  });
}

export function useLeaveServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serverId: bigint) => {
      throw new Error('Server functionality not yet implemented in backend');
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave server: ${error.message}`);
    },
  });
}

export function useGetServerOrdering() {
  return useQuery<bigint[]>({
    queryKey: ['serverOrdering'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useSetServerOrdering() {
  return useMutation({
    mutationFn: async (ordering: bigint[]) => {
      throw new Error('Server functionality not yet implemented in backend');
    },
  });
}

export function useGetCategoryChannelOrdering(serverId: bigint | null) {
  return useQuery<ServerOrdering | null>({
    queryKey: ['categoryChannelOrdering', serverId?.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useUpdateCategoryChannelOrdering() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Channel functionality not yet implemented in backend');
    },
  });
}

export function useGetCategories(serverId: bigint | null) {
  return useQuery<ChannelCategory[]>({
    queryKey: ['categories', serverId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddCategoryToServer() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Channel functionality not yet implemented in backend');
    },
  });
}

export function useAddTextChannel() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Channel functionality not yet implemented in backend');
    },
  });
}

export function useAddVoiceChannel() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Channel functionality not yet implemented in backend');
    },
  });
}

export function useMoveChannelToCategory() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Channel functionality not yet implemented in backend');
    },
  });
}

export function useGetServerRoles(serverId: bigint | null) {
  return useQuery<Role[]>({
    queryKey: ['serverRoles', serverId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddRole() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Role functionality not yet implemented in backend');
    },
  });
}

export function useSetRolePermissions() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Role functionality not yet implemented in backend');
    },
  });
}

export function useAssignRoleToUser() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Role functionality not yet implemented in backend');
    },
  });
}

export function useRemoveRoleFromUser() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Role functionality not yet implemented in backend');
    },
  });
}

export function useGetServerMembers(serverId: bigint | null) {
  return useQuery<ServerMember[]>({
    queryKey: ['serverMembers', serverId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetServerMembersWithUsernames(serverId: bigint | null) {
  return useQuery<ServerMemberWithUsername[]>({
    queryKey: ['serverMembersWithUsernames', serverId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetMembersWithRoles(serverId: bigint | null) {
  return useQuery<GetMembersWithRolesResponse | null>({
    queryKey: ['membersWithRoles', serverId?.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useGetTextChannelMessages(serverId: bigint | null, textChannelId: bigint | null) {
  return useQuery<TextChannelMessage[]>({
    queryKey: ['textChannelMessages', serverId?.toString(), textChannelId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useSendTextChannelMessage() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Message functionality not yet implemented in backend');
    },
  });
}

export function useGetVoiceChannelParticipants(serverId: bigint | null, voiceChannelId: bigint | null) {
  return useQuery<VoiceChannelPresence[]>({
    queryKey: ['voiceChannelParticipants', serverId?.toString(), voiceChannelId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useJoinVoiceChannel() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Voice channel functionality not yet implemented in backend');
    },
  });
}

export function useLeaveVoiceChannel() {
  return useMutation({
    mutationFn: async (params: any) => {
      throw new Error('Voice channel functionality not yet implemented in backend');
    },
  });
}

export function useGetAuditLog(serverId: bigint | null) {
  return useQuery<AuditLogEntry[]>({
    queryKey: ['auditLog', serverId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}
