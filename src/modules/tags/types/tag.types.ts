export interface Tag {
    id: string;
    slug: string;
    name_vi: string;
    name_en: string;
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

export interface CreateTagDto {
    name_vi: string;
    name_en: string;
}

export interface UpdateTagDto {
    name_vi?: string;
    name_en?: string;
}

export interface TagQuery {
    keyword?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}
