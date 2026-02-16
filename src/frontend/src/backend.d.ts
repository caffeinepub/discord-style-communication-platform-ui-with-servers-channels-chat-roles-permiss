import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VoiceChannel {
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
export interface ChannelCategory {
    id: bigint;
    name: string;
    voiceChannels: Array<VoiceChannel>;
    isExpanded: boolean;
    textChannels: Array<TextChannel>;
}
export interface VoiceChannelPresence {
    userId: Principal;
    joinedAt: bigint;
    voiceChannelId: bigint;
    serverId: bigint;
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
export interface Permission {
    value: boolean;
    name: string;
}
export interface TextChannel {
    id: bigint;
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
    discoverServers(): Promise<Array<Server>>;
    getAllServers(): Promise<Array<Server>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerUsername(): Promise<string | null>;
    getCategories(serverId: bigint): Promise<Array<ChannelCategory>>;
    getFriendRequests(): Promise<Array<FriendRequest>>;
    getFriends(): Promise<Array<Principal>>;
    getRoles(serverId: bigint): Promise<Array<Role>>;
    getServer(serverId: bigint): Promise<Server>;
    getServerMembers(serverId: bigint): Promise<Array<ServerMember>>;
    getServerOrdering(): Promise<Array<bigint>>;
    getTextChannelMessages(serverId: bigint, textChannelId: bigint, startFromMessageId: bigint | null): Promise<Array<TextChannelMessage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStatus(user: Principal): Promise<UserStatus | null>;
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
    updateServerSettings(serverId: bigint, description: string, bannerUrl: string, iconUrl: string, communityMode: boolean): Promise<void>;
}
