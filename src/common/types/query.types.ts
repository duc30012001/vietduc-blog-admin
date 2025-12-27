// Sort order type
export type SortOrder = "asc" | "desc";

// Base query parameters for pagination
export interface BaseQuery {
    keyword?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: SortOrder;
}

// Pagination meta matching server's PaginationMeta
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Paginated response matching server's PaginatedResponseDto
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// API response wrapper matching server's TransformInterceptor
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}

// Wrapped paginated response (what the API actually returns)
export type ApiPaginatedResponse<T> = ApiResponse<PaginatedResponse<T>>;
