// Local type definitions for features not yet implemented in the backend
// These types allow the frontend to compile while backend functionality is being developed

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

export interface ServerMember {
  userId: string;
  roles: bigint[];
  joinedAt: bigint;
}

export interface Server {
  id: bigint;
  name: string;
  description: string;
  bannerUrl: string;
  iconUrl: string;
  owner: string;
  channels: ChannelCategory[];
  roles: Role[];
  members: ServerMember[];
  communityMode: boolean;
}

export interface TextChannelMessage {
  id: bigint;
  serverId: bigint;
  textChannelId: bigint;
  createdBy: string;
  createdAt: bigint;
  content: string;
  isPersistent: boolean;
}

export interface VoiceChannelPresence {
  serverId: bigint;
  voiceChannelId: bigint;
  userId: string;
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

export interface AuditLogEntry {
  id: bigint;
  timestamp: bigint;
  eventType: AuditEventType;
  serverId: bigint;
  userId: string;
  details: string;
}

export type AuditEventType =
  | { ServerCreated: null }
  | { ServerRenamed: null }
  | { SettingsUpdated: null }
  | { CategoryAdded: null }
  | { TextChannelAdded: null }
  | { VoiceChannelAdded: null }
  | { ChannelMoved: null }
  | { RoleAdded: null }
  | { RolePermissionsSet: null }
  | { RoleAssignedToUser: null }
  | { RoleRemovedFromUser: null }
  | { MessageSent: null }
  | { UserJoinedVoiceChannel: null }
  | { UserLeftVoiceChannel: null }
  | { ServerJoined: null }
  | { ServerLeft: null };
