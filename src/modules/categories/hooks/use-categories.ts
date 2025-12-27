import { queryKeys } from "@/common/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../api";
import type {
    BulkUpdateOrderDto,
    CategoryQuery,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "../types";

/**
 * Hook to get categories with pagination
 */
export const useCategories = (query?: CategoryQuery) => {
    return useQuery({
        queryKey: queryKeys.categories.list(query as Record<string, unknown>),
        queryFn: () => categoryApi.getCategories(query),
        placeholderData: (prev) => prev,
    });
};

/**
 * Hook to get category tree
 */
export const useCategoryTree = () => {
    return useQuery({
        queryKey: [...queryKeys.categories.all, "tree"],
        queryFn: categoryApi.getCategoryTree,
    });
};

/**
 * Hook to get a single category by ID
 */
export const useCategory = (id: string) => {
    return useQuery({
        queryKey: queryKeys.categories.detail(id),
        queryFn: () => categoryApi.getCategory(id),
        enabled: !!id,
        placeholderData: (prev) => prev,
    });
};

/**
 * Hook to create a category
 */
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateCategoryDto) => categoryApi.createCategory(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
};

/**
 * Hook to update a category
 */
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
            categoryApi.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
};

/**
 * Hook to bulk update category order (for drag-drop tree)
 */
export const useBulkUpdateCategoryOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: BulkUpdateOrderDto) => categoryApi.bulkUpdateOrder(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoryApi.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
};
