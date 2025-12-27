import type { BaseQuery } from "@/common/types";

// Post status type
export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// Tag brief interface
export interface TagBrief {
    id: string;
    name_vi: string;
    name_en: string;
}

// Category brief interface
export interface CategoryBrief {
    id: string;
    name_vi: string;
    name_en: string;
}

// User brief interface
export interface UserBrief {
    id: string;
    name: string;
}

// Post response interface matching server's PostResponseDto
export interface Post {
    id: string;
    slug: string;
    title_vi: string;
    title_en: string;
    excerpt_vi?: string;
    excerpt_en?: string;
    content_vi: string;
    content_en: string;
    thumbnail?: string;
    status: PostStatus;
    view_count: number;
    published_at?: string;
    category_id?: string;
    category?: CategoryBrief;
    tags?: TagBrief[];
    creator?: UserBrief;
    modifier?: UserBrief;
    created_at: string;
    updated_at: string;
}

// Create post DTO
export interface CreatePostDto {
    title_vi: string;
    title_en: string;
    excerpt_vi: string;
    excerpt_en: string;
    content_vi: string;
    content_en: string;
    thumbnail?: string;
    status?: PostStatus;
    category_id: string;
    tags?: string[];
}

// Update post DTO (all fields optional)
export interface UpdatePostDto {
    title_vi?: string;
    title_en?: string;
    excerpt_vi?: string;
    excerpt_en?: string;
    content_vi?: string;
    content_en?: string;
    thumbnail?: string;
    status?: PostStatus;
    category_id?: string | null;
    tags?: string[];
}

// Query parameters for fetching posts
export interface PostQuery extends BaseQuery {
    status?: PostStatus;
    category_id?: string;
}
