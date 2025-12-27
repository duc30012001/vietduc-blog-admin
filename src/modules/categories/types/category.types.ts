import type { BaseQuery } from "@/common/types";

// Category response interface matching server's CategoryResponseDto
export interface Category {
    id: string;
    slug: string;
    name_vi: string;
    name_en: string;
    description?: string;
    order: number;
    parent_id?: string;
    children?: Category[];
    creator?: {
        id: string;
        name: string;
    };
    modifier?: {
        id: string;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

// Create category DTO
export interface CreateCategoryDto {
    name_vi: string;
    name_en: string;
    description?: string;
    parent_id?: string;
}

// Update category DTO (all fields optional)
export interface UpdateCategoryDto {
    name_vi?: string;
    name_en?: string;
    description?: string;
    parent_id?: string | null;
}

// Query parameters for fetching categories
export interface CategoryQuery extends BaseQuery {
    parent_id?: string;
}

// Item for bulk order update
export interface BulkUpdateOrderItem {
    id: string;
    parent_id?: string | null;
    order: number;
}

// Bulk update order DTO
export interface BulkUpdateOrderDto {
    items: BulkUpdateOrderItem[];
}

// Bulk update response
export interface BulkUpdateOrderResponse {
    updated: number;
}
