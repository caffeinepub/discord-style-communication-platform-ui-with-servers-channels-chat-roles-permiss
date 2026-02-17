import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Category {
    id: string;
    name: string;
    serverId: string;
}
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
export interface Channel {
    id: string;
    categoryId: string;
    channelType: ChannelType;
    name: string;
    serverId: string;
}
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
export enum ChannelType {
    voice = "voice",
    text = "text"
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
    addTextChannelToCategory(serverId: string, categoryId: string, name: string): Promise<Channel>;
    addVoiceChannelToCategory(serverId: string, categoryId: string, name: string): Promise<Channel>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(serverId: string, name: string): Promise<Category>;
    createServer(payload: CreateServerPayload): Promise<Server>;
    deleteCategory(serverId: string, categoryId: string): Promise<void>;
    getAllServers(): Promise<Array<Server>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(serverId: string): Promise<Array<Category>>;
    getServer(id: string): Promise<Server | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    register(payload: RegisterPayload): Promise<RegistrationResult>;
    renameCategory(serverId: string, categoryId: string, newName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCategoryOrder(serverId: string, newOrder: Array<string>): Promise<void>;
    setChannelOrder(serverId: string, categoryId: string, newOrder: Array<string>): Promise<void>;
}
