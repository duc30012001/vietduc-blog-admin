import { queryKeys } from "@/common/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tagApi } from "../api";
import type { CreateTagDto, TagQuery, UpdateTagDto } from "../types";

export function useTags(query?: TagQuery) {
    return useQuery({
        queryKey: queryKeys.tags.list(query as Record<string, unknown>),
        queryFn: () => tagApi.getTags(query),
    });
}

export function useTag(id: string) {
    return useQuery({
        queryKey: queryKeys.tags.detail(id),
        queryFn: () => tagApi.getTag(id),
        enabled: !!id,
    });
}

export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTagDto) => tagApi.createTag(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
        },
    });
}

export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTagDto }) =>
            tagApi.updateTag(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
        },
    });
}

export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tagApi.deleteTag(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
        },
    });
}
