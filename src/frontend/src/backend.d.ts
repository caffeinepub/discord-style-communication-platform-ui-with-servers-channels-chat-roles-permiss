import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GetMembersWithRolesResponse {
    members: Array<ServerMemberInfo>;
    roles: Array<Role>;
}
export interface ServerMemberWithUsername {
    member: ServerMember;
    username: string;
}
export interface AuditLogEntry {
    id: bigint;
    userId: Principal;
    timestamp: bigint;
    details: string;
    serverId: bigint;
    eventType: AuditEventType;
}
export interface TextChannelMessage {
    id: bigint;
    content: string;
    createdAt: bigint;
    createdBy: Principal;
    isPersistent: boolean;
    textChannelId: bigint;
    serverId: bigint;
}
export interface TextChannel {
    id: bigint;
    name: string;
}
export interface Server {
    id: bigint;
    members: Array<ServerMember>;
    owner: Principal;
    name: string;
    description: string;
    channels: Array<ChannelCategory>;
    communityMode: boolean;
    bannerUrl: string;
    iconUrl: string;
    roles: Array<Role>;
}
export interface Role {
    id: bigint;
    permissions: Array<Permission>;
    name: string;
    color: string;
    position: bigint;
}
export interface FriendRequest {
    to: Principal;
    from: Principal;
    timestamp: bigint;
}
export interface ServerMember {
    userId: Principal;
    joinedAt: bigint;
    roles: Array<bigint>;
}
export interface ServerMemberInfo {
    member: ServerMember;
    username: string;
}
export interface VoiceChannelPresence {
    userId: Principal;
    joinedAt: bigint;
    voiceChannelId: bigint;
    serverId: bigint;
}
export interface ChannelCategory {
    id: bigint;
    name: string;
    voiceChannels: Array<VoiceChannel>;
    isExpanded: boolean;
    textChannels: Array<TextChannel>;
}
export interface Permission {
    value: boolean;
    name: string;
}
export interface UserProfile {
    customStatus: string;
    aboutMe: string;
    name: string;
    badges: Array<string>;
    avatarUrl: string;
    bannerUrl: string;
}
export interface VoiceChannel {
    id: bigint;
    name: string;
}
export enum AuditEventType {
    UserJoinedVoiceChannel = "UserJoinedVoiceChannel",
    ServerCreated = "ServerCreated",
    RoleAssignedToUser = "RoleAssignedToUser",
    VoiceChannelAdded = "VoiceChannelAdded",
    RoleRemovedFromUser = "RoleRemovedFromUser",
    RolePermissionsSet = "RolePermissionsSet",
    MessageSent = "MessageSent",
    ServerLeft = "ServerLeft",
    UserLeftVoiceChannel = "UserLeftVoiceChannel",
    ServerRenamed = "ServerRenamed",
    CategoryAdded = "CategoryAdded",
    ChannelMoved = "ChannelMoved",
    ServerJoined = "ServerJoined",
    TextChannelAdded = "TextChannelAdded",
    SettingsUpdated = "SettingsUpdated",
    RoleAdded = "RoleAdded"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserStatus {
    Idle = "Idle",
    Online = "Online",
    Invisible = "Invisible",
    DoNotDisturb = "DoNotDisturb"
}
export interface backendInterface {
    acceptFriendRequest(from: Principal): Promise<void>;
    addCategoryToServer(serverId: bigint, categoryName: string): Promise<bigint>;
    addRole(serverId: bigint, _name: string, color: string, permissions: Array<Permission>): Promise<bigint>;
    addTextChannel(serverId: bigint, categoryId: bigint, channelName: string): Promise<bigint>;
    addVoiceChannel(serverId: bigint, categoryId: bigint, channelName: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRoleToUser(serverId: bigint, _roleId: bigint, _user: Principal): Promise<void>;
    blockUser(user: Principal): Promise<void>;
    createServer(_name: string, description: string): Promise<bigint>;
    declineFriendRequest(from: Principal): Promise<void>;
    getAllServers(): Promise<Array<Server>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerUsername(): Promise<string | null>;
    getCategories(serverId: bigint): Promise<Array<ChannelCategory>>;
    getCategoryChannelOrdering(serverId: bigint): Promise<{
        categoryOrder: Array<bigint>;
        voiceChannelOrder: Array<[bigint, Array<bigint>]>;
        textChannelOrder: Array<[bigint, Array<bigint>]>;
    } | null>;
    getFriendRequests(): Promise<Array<FriendRequest>>;
    getFriends(): Promise<Array<Principal>>;
    getMemberDisplayColor(serverId: bigint, userId: Principal): Promise<string | null>;
    getRoles(serverId: bigint): Promise<Array<Role>>;
    getServer(serverId: bigint): Promise<Server>;
    getServerAuditLog(serverId: bigint): Promise<Array<AuditLogEntry>>;
    getServerMembers(serverId: bigint): Promise<Array<ServerMember>>;
    getServerMembersWithRoles(serverId: bigint): Promise<GetMembersWithRolesResponse>;
    getServerMembersWithUsernames(serverId: bigint): Promise<Array<ServerMemberWithUsername>>;
    getServerOrdering(): Promise<Array<bigint>>;
    getServerRoles(serverId: bigint): Promise<Array<Role>>;
    getTextChannelMessages(serverId: bigint, textChannelId: bigint, startFromMessageId: bigint | null): Promise<Array<TextChannelMessage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStatus(user: Principal): Promise<UserStatus | null>;
    getUsernameForUser(user: Principal): Promise<string | null>;
    getVoiceChannelParticipants(serverId: bigint, voiceChannelId: bigint): Promise<Array<VoiceChannelPresence>>;
    healthCheck(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    joinServer(serverId: bigint): Promise<void>;
    joinVoiceChannel(serverId: bigint, voiceChannelId: bigint): Promise<void>;
    leaveServer(serverId: bigint): Promise<void>;
    leaveVoiceChannel(serverId: bigint, voiceChannelId: bigint): Promise<void>;
    removeFriend(friend: Principal): Promise<void>;
    removeRoleFromUser(serverId: bigint, _roleId: bigint, _user: Principal): Promise<void>;
    renameServer(serverId: bigint, newName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendFriendRequest(to: Principal): Promise<void>;
    sendTextChannelMessage(serverId: bigint, textChannelId: bigint, content: string): Promise<bigint>;
    setRolePermissions(serverId: bigint, _roleId: bigint, _permissions: Array<Permission>): Promise<void>;
    setServerOrdering(ordering: Array<bigint>): Promise<void>;
    setUserStatus(status: UserStatus): Promise<void>;
    setUsername(desiredUsername: string): Promise<void>;
    updateCategoryChannelOrdering(serverId: bigint, categoryOrder: Array<bigint>, textChannelOrderEntries: Array<[bigint, Array<bigint>]>, voiceChannelOrderEntries: Array<[bigint, Array<bigint>]>): Promise<void>;
}
