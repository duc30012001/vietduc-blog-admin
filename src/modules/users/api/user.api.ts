import type { ApiResponse, PaginatedResponse } from "@/common/types";
import axiosClient from "@/config/axios";
import type { SyncFirebaseResult, UpdateUserDto, User, UserQuery } from "../types";

const USERS_ENDPOINT = "/users";

export const userApi = {
    /**
     * Get current authenticated user (syncs Firebase user to DB)
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await axiosClient.get<ApiResponse<User>>(`${USERS_ENDPOINT}/me`);
        return response.data.data;
    },

    /**
     * Get all users with pagination (admin only)
     */
    getUsers: async (query?: UserQuery): Promise<PaginatedResponse<User>> => {
        const response = await axiosClient.get<ApiResponse<PaginatedResponse<User>>>(
            USERS_ENDPOINT,
            {
                params: query,
            }
        );
        return response.data.data;
    },

    /**
     * Get user by ID
     */
    getUser: async (id: string): Promise<User> => {
        const response = await axiosClient.get<ApiResponse<User>>(`${USERS_ENDPOINT}/${id}`);
        return response.data.data;
    },

    /**
     * Update user
     */
    updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
        const response = await axiosClient.patch<ApiResponse<User>>(
            `${USERS_ENDPOINT}/${id}`,
            data
        );
        return response.data.data;
    },

    /**
     * Sync all users from Firebase to database
     */
    syncFirebaseUsers: async (): Promise<SyncFirebaseResult> => {
        const response = await axiosClient.post<ApiResponse<SyncFirebaseResult>>(
            `${USERS_ENDPOINT}/sync-firebase`
        );
        return response.data.data;
    },
};
