import type { Principal } from '@dfinity/principal';

// Extended types that match the backend but aren't in the generated interface
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface Permission {
  name: string;
  value: boolean;
}

export interface Role {
  id: bigint;
  name: string;
  color: string;
  permissions: Permission[];
  position: bigint;
}

export interface TextChannel {
  id: bigint;
  name: string;
}

export interface VoiceChannel {
  id: bigint;
  name: string;
}

export interface ChannelCategory {
  id: bigint;
  name: string;
  textChannels: TextChannel[];
  voiceChannels: VoiceChannel[];
  isExpanded: boolean;
}

export interface ServerMember {
  userId: Principal;
  roles: bigint[];
  joinedAt: bigint;
}

export interface Server {
  id: bigint;
  name: string;
  description: string;
  bannerUrl: string;
  iconUrl: string;
  owner: Principal;
  channels: ChannelCategory[];
  roles: Role[];
  members: ServerMember[];
  communityMode: boolean;
}

export interface TextChannelMessage {
  id: bigint;
  serverId: bigint;
  textChannelId: bigint;
  createdBy: Principal;
  createdAt: bigint;
  content: string;
  isPersistent: boolean;
}

export interface VoiceChannelPresence {
  serverId: bigint;
  voiceChannelId: bigint;
  userId: Principal;
  joinedAt: bigint;
}

export interface CategoryLevelOrdering {
  id: bigint;
  textChannels: bigint[];
  voiceChannels: bigint[];
}

export interface ServerOrdering {
  categoryOrder: bigint[];
  categories: CategoryLevelOrdering[];
}

export type UserStatus = 
  | { __kind__: 'Online' }
  | { __kind__: 'Idle' }
  | { __kind__: 'DoNotDisturb' }
  | { __kind__: 'Invisible' };

export interface FriendRequest {
  from: string;
  to: string;
  timestamp: bigint;
}

export type AuditEventType =
  | { __kind__: 'ServerCreated' }
  | { __kind__: 'ServerRenamed' }
  | { __kind__: 'SettingsUpdated' }
  | { __kind__: 'CategoryAdded' }
  | { __kind__: 'TextChannelAdded' }
  | { __kind__: 'VoiceChannelAdded' }
  | { __kind__: 'ChannelMoved' }
  | { __kind__: 'RoleAdded' }
  | { __kind__: 'RolePermissionsSet' }
  | { __kind__: 'RoleAssignedToUser' }
  | { __kind__: 'RoleRemovedFromUser' }
  | { __kind__: 'MessageSent' }
  | { __kind__: 'UserJoinedVoiceChannel' }
  | { __kind__: 'UserLeftVoiceChannel' }
  | { __kind__: 'ServerJoined' }
  | { __kind__: 'ServerLeft' };

export interface AuditLogEntry {
  id: bigint;
  timestamp: bigint;
  eventType: AuditEventType;
  serverId: bigint;
  userId: Principal;
  details: string;
}

export interface ServerMemberWithUsername {
  member: ServerMember;
  username: string;
}

export interface ServerMemberInfo {
  member: ServerMember;
  username: string;
}

export interface GetMembersWithRolesResponse {
  members: ServerMemberInfo[];
  roles: Role[];
}
