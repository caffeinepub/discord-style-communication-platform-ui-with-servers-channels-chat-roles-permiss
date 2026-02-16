import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Session {
    token: string;
    expiresAt: bigint;
    accountId: string;
    email?: string;
}
export interface FriendRequest {
    to: Principal;
    from: Principal;
    timestamp: bigint;
}
export interface RegisterPayload {
    username: string;
    password: string;
    email: string;
}
export interface UserProfile {
    customStatus: string;
    aboutMe: string;
    name: string;
    badges: Array<string>;
    avatarUrl: string;
    bannerUrl: string;
}
export interface AdminVerificationData {
    auditLogCount: bigint;
    userProfileCount: bigint;
    sessionCount: bigint;
    serverCount: bigint;
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
    adminCheckWipeResult(): Promise<AdminVerificationData>;
    adminWipeReplicaData(): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(user: Principal): Promise<void>;
    declineFriendRequest(from: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerUsername(): Promise<string | null>;
    getFriendRequests(): Promise<Array<FriendRequest>>;
    getFriends(): Promise<Array<Principal>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStatus(user: Principal): Promise<UserStatus | null>;
    getUsernameForUser(user: Principal): Promise<string | null>;
    isCallerAdmin(): Promise<boolean>;
    register(payload: RegisterPayload): Promise<Session>;
    removeFriend(friend: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendFriendRequest(to: Principal): Promise<void>;
    setUserStatus(status: UserStatus): Promise<void>;
    setUsername(desiredUsername: string): Promise<void>;
    validateSession(token: string): Promise<Session | null>;
}
