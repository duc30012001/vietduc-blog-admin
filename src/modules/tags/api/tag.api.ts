import type { ApiResponse, PaginatedResponse } from "@/common/types";
import axiosClient from "@/config/axios";
import type { CreateTagDto, Tag, TagQuery, UpdateTagDto } from "../types";

const BASE_URL = "/tags";

export const tagApi = {
    createTag: async (data: CreateTagDto): Promise<Tag> => {
        const response = await axiosClient.post<ApiResponse<Tag>>(BASE_URL, data);
        return response.data.data;
    },

    getTags: async (query?: TagQuery): Promise<PaginatedResponse<Tag>> => {
        const response = await axiosClient.get<ApiResponse<PaginatedResponse<Tag>>>(BASE_URL, {
            params: query,
        });
        return response.data.data;
    },

    getTag: async (id: string): Promise<Tag> => {
        const response = await axiosClient.get<ApiResponse<Tag>>(`${BASE_URL}/${id}`);
        return response.data.data;
    },

    updateTag: async (id: string, data: UpdateTagDto): Promise<Tag> => {
        const response = await axiosClient.patch<ApiResponse<Tag>>(`${BASE_URL}/${id}`, data);
        return response.data.data;
    },

    deleteTag: async (id: string): Promise<void> => {
        await axiosClient.delete(`${BASE_URL}/${id}`);
    },
};
