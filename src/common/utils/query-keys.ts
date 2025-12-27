/**
 * Query Keys Factory
 * Creates structured query keys for easy reuse and invalidation
 *
 * Usage:
 * - queryKeys.users.all         -> ["users"]
 * - queryKeys.users.lists()     -> ["users", "list"]
 * - queryKeys.users.list(query) -> ["users", "list", { ...query }]
 * - queryKeys.users.details()   -> ["users", "detail"]
 * - queryKeys.users.detail(id)  -> ["users", "detail", id]
 *
 * Invalidation:
 * - queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
 *   Invalidates all user queries
 * - queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
 *   Invalidates all user list queries
 */

export const queryKeys = {
    users: {
        all: ["users"] as const,
        lists: () => [...queryKeys.users.all, "list"] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.users.lists(), filters] as const,
        details: () => [...queryKeys.users.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
    },
    tags: {
        all: ["tags"] as const,
        lists: () => [...queryKeys.tags.all, "list"] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.tags.lists(), filters] as const,
        details: () => [...queryKeys.tags.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.tags.details(), id] as const,
    },
    categories: {
        all: ["categories"] as const,
        lists: () => [...queryKeys.categories.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.categories.lists(), filters] as const,
        details: () => [...queryKeys.categories.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    },
    posts: {
        all: ["posts"] as const,
        lists: () => [...queryKeys.posts.all, "list"] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.posts.lists(), filters] as const,
        details: () => [...queryKeys.posts.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    },
    comments: {
        all: ["comments"] as const,
        lists: () => [...queryKeys.comments.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.comments.lists(), filters] as const,
        details: () => [...queryKeys.comments.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.comments.details(), id] as const,
    },
};
