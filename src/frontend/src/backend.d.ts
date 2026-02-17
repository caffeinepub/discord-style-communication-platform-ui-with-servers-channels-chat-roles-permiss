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
    email: string;
}
export interface RegisterPayload {
    username: string;
    password: string;
    email: string;
}
export interface LoginPayload {
    password: string;
    loginIdentifier: string;
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
export enum RegistrationError {
    emailTaken = "emailTaken",
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
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(payload: LoginPayload): Promise<Session | null>;
    register(payload: RegisterPayload): Promise<RegistrationResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
