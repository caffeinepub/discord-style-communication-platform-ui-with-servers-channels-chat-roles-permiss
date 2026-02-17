import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CreateServerPayload {
    name: string;
    description: string;
    bannerURL: string;
    isPublic: boolean;
    iconURL: string;
}
export interface RegisterPayload {
    username: string;
    password: string;
    email: string;
}
export type RegistrationResult = {
    __kind__: "error";
    error: RegistrationError;
} | {
    __kind__: "success";
    success: null;
};
export interface UserProfile {
    customStatus: string;
    aboutMe: string;
    name: string;
    badges: Array<string>;
    avatarUrl: string;
    bannerUrl: string;
}
export interface Server {
    id: string;
    name: string;
    description: string;
    bannerURL: string;
    isPublic: boolean;
    iconURL: string;
}
export enum RegistrationError {
    emailTaken = "emailTaken",
    roleAssignmentFailed = "roleAssignmentFailed",
    alreadyRegistered = "alreadyRegistered",
    unknown_ = "unknown",
    usernameTaken = "usernameTaken"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createServer(payload: CreateServerPayload): Promise<void>;
    getAllServers(): Promise<Array<Server>>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerUsername(): Promise<string | null>;
    getServerById(id: string): Promise<Server | null>;
    getUserProfile(username: string): Promise<UserProfile | null>;
    getUsernameForUser(user: Principal): Promise<string | null>;
    isCallerAdmin(): Promise<boolean>;
    isMemberOfServer(serverId: string): Promise<boolean>;
    register(payload: RegisterPayload): Promise<RegistrationResult>;
}
