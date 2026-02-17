import type { Principal } from '@dfinity/principal';
import type { Category, Channel } from '../backend';

// Extended types that match the backend but aren't in the generated interface
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface RegistrationResult {
  __kind__: 'success' | 'error';
  error?: RegistrationError;
}

export interface RegistrationError {
  __kind__: 'alreadyRegistered' | 'usernameTaken' | 'emailTaken' | 'roleAssignmentFailed' | 'unknown';
}

export interface UserProfile {
  name: string;
  aboutMe: string;
  customStatus: string;
  avatarUrl: string;
  bannerUrl: string;
  badges: string[];
}

export interface Permission {
  name: string;
  value: boolean;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
  position: string;
}

export interface TextChannel {
  id: string;
  name: string;
}

export interface VoiceChannel {
  id: string;
  name: string;
}

export interface ChannelCategory {
  id: string;
  name: string;
  textChannels: TextChannel[];
  voiceChannels: VoiceChannel[];
  isExpanded: boolean;
}

export interface ServerMember {
  userId: Principal;
  roles: string[];
  joinedAt: bigint;
}

export interface Server {
  id: string;
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
  id: string;
  serverId: string;
  textChannelId: string;
  createdBy: Principal;
  createdAt: bigint;
  content: string;
  isPersistent: boolean;
}

export interface VoiceChannelPresence {
  serverId: string;
  voiceChannelId: string;
  userId: Principal;
  joinedAt: bigint;
}

export interface CategoryLevelOrdering {
  id: string;
  textChannels: string[];
  voiceChannels: string[];
}

export interface ServerOrdering {
  categoryOrder: string[];
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
  id: string;
  timestamp: bigint;
  eventType: AuditEventType;
  serverId: string;
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

// Helper to convert backend Category to extended ChannelCategory
export function categoryToChannelCategory(category: Category): ChannelCategory {
  return {
    id: category.id,
    name: category.name,
    textChannels: [],
    voiceChannels: [],
    isExpanded: true,
  };
}
