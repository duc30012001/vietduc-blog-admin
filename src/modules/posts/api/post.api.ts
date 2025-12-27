import type { ApiResponse, PaginatedResponse } from "@/common/types";
import axiosClient from "@/config/axios";
import type { CreatePostDto, Post, PostQuery, UpdatePostDto } from "../types";

const POSTS_ENDPOINT = "/posts";

export const postApi = {
    /**
     * Create a new post
     */
    createPost: async (dto: CreatePostDto): Promise<Post> => {
        const response = await axiosClient.post<ApiResponse<Post>>(POSTS_ENDPOINT, dto);
        return response.data.data;
    },

    /**
     * Get all posts with pagination
     */
    getPosts: async (query?: PostQuery): Promise<PaginatedResponse<Post>> => {
        const response = await axiosClient.get<ApiResponse<PaginatedResponse<Post>>>(
            POSTS_ENDPOINT,
            { params: query }
        );
        return response.data.data;
    },

    /**
     * Get post by ID
     */
    getPost: async (id: string): Promise<Post> => {
        const response = await axiosClient.get<ApiResponse<Post>>(`${POSTS_ENDPOINT}/${id}`);
        return response.data.data;
    },

    /**
     * Update post
     */
    updatePost: async (id: string, dto: UpdatePostDto): Promise<Post> => {
        const response = await axiosClient.patch<ApiResponse<Post>>(`${POSTS_ENDPOINT}/${id}`, dto);
        return response.data.data;
    },

    /**
     * Delete post
     */
    deletePost: async (id: string): Promise<void> => {
        await axiosClient.delete(`${POSTS_ENDPOINT}/${id}`);
    },
};
