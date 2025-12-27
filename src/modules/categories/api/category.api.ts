import type { ApiResponse, PaginatedResponse } from "@/common/types";
import axiosClient from "@/config/axios";
import type {
    BulkUpdateOrderDto,
    BulkUpdateOrderResponse,
    Category,
    CategoryQuery,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "../types";

const CATEGORIES_ENDPOINT = "/categories";

export const categoryApi = {
    /**
     * Create a new category
     */
    createCategory: async (dto: CreateCategoryDto): Promise<Category> => {
        const response = await axiosClient.post<ApiResponse<Category>>(CATEGORIES_ENDPOINT, dto);
        return response.data.data;
    },

    /**
     * Get all categories with pagination
     */
    getCategories: async (query?: CategoryQuery): Promise<PaginatedResponse<Category>> => {
        const response = await axiosClient.get<ApiResponse<PaginatedResponse<Category>>>(
            CATEGORIES_ENDPOINT,
            { params: query }
        );
        return response.data.data;
    },

    /**
     * Get category tree structure
     */
    getCategoryTree: async (): Promise<Category[]> => {
        const response = await axiosClient.get<ApiResponse<Category[]>>(
            `${CATEGORIES_ENDPOINT}/tree`
        );
        return response.data.data;
    },

    /**
     * Get category by ID
     */
    getCategory: async (id: string): Promise<Category> => {
        const response = await axiosClient.get<ApiResponse<Category>>(
            `${CATEGORIES_ENDPOINT}/${id}`
        );
        return response.data.data;
    },

    /**
     * Update category
     */
    updateCategory: async (id: string, dto: UpdateCategoryDto): Promise<Category> => {
        const response = await axiosClient.patch<ApiResponse<Category>>(
            `${CATEGORIES_ENDPOINT}/${id}`,
            dto
        );
        return response.data.data;
    },

    /**
     * Bulk update order and parent relationships (for drag-drop tree)
     */
    bulkUpdateOrder: async (dto: BulkUpdateOrderDto): Promise<BulkUpdateOrderResponse> => {
        const response = await axiosClient.post<ApiResponse<BulkUpdateOrderResponse>>(
            `${CATEGORIES_ENDPOINT}/bulk-update-order`,
            dto
        );
        return response.data.data;
    },

    /**
     * Delete category
     */
    deleteCategory: async (id: string): Promise<void> => {
        await axiosClient.delete(`${CATEGORIES_ENDPOINT}/${id}`);
    },
};
