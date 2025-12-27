import { queryKeys } from "@/common/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../api";
import type { CreatePostDto, PostQuery, UpdatePostDto } from "../types";

/**
 * Hook to get posts with pagination
 */
export const usePosts = (query?: PostQuery) => {
    return useQuery({
        queryKey: queryKeys.posts.list(query as Record<string, unknown>),
        queryFn: () => postApi.getPosts(query),
        placeholderData: (prev) => prev,
    });
};

/**
 * Hook to get a single post by ID
 */
export const usePost = (id: string) => {
    return useQuery({
        queryKey: queryKeys.posts.detail(id),
        queryFn: () => postApi.getPost(id),
        enabled: !!id,
        placeholderData: (prev) => prev,
    });
};

/**
 * Hook to create a post
 */
export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreatePostDto) => postApi.createPost(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
    });
};

/**
 * Hook to update a post
 */
export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePostDto }) =>
            postApi.updatePost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
    });
};

/**
 * Hook to delete a post
 */
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postApi.deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
    });
};
