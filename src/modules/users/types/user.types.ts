import type { BaseQuery } from "@/common/types";

// User role enum
export type UserRole = "ADMIN" | "USER";

// Auth provider enum
export type AuthProvider = "EMAIL" | "GOOGLE" | "FACEBOOK";

// User interface matching server's UserResponseDto
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: UserRole;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

// User account (auth provider link)
export interface UserAccount {
    id: string;
    provider: AuthProvider;
    provider_id: string;
    created_at: string;
    updated_at: string;
}

// Query parameters for fetching users (extends BaseQuery)
export interface UserQuery extends BaseQuery {
    role?: UserRole;
    is_verified?: boolean;
}

// Sync Firebase result
export interface SyncFirebaseResult {
    synced: number;
    total: number;
    errors: string[];
}

// Update user DTO
export interface UpdateUserDto {
    name?: string;
    avatar?: string;
    role?: UserRole;
}
