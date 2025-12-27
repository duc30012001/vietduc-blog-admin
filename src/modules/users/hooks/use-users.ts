import { queryKeys } from "@/common/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import type { UpdateUserDto, UserQuery } from "../types";

export const CURRENT_USER_QUERY_KEY = ["currentUser"];

/**
 * Hook to get current authenticated user
 * Automatically syncs Firebase user data to server
 */
export const useCurrentUser = () => {
    return useQuery({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: userApi.getCurrentUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to get all users
 */
export const useUsers = (query?: UserQuery) => {
    return useQuery({
        queryKey: queryKeys.users.list(query as Record<string, unknown>),
        queryFn: () => userApi.getUsers(query),
        placeholderData: (prev) => prev,
    });
};

/**
 * Hook to get a single user by ID
 */
export const useUser = (id: string) => {
    return useQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: () => userApi.getUser(id),
        enabled: !!id,
        placeholderData: (prev) => prev,
    });
};

/**
 * Hook to update a user
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
            userApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
};

/**
 * Hook to sync all Firebase users to database
 */
export const useSyncFirebaseUsers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.syncFirebaseUsers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
};
