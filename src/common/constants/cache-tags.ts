/**
 * Next.js cache tags used by the client app.
 * These must match the tags in `vietduc-blog-client-v2/libs/api/public.ts`.
 */
export const CACHE_TAGS = {
    POSTS: "posts",
    CATEGORIES: "categories",
    SITE_SETTINGS: "site-settings",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
