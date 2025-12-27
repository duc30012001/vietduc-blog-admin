import type { BaseQuery } from "@/common/types";
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryStates } from "nuqs";

// Default parsers for common query parameters
const baseQueryParsers = {
    keyword: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
};

// Create parsers for specific modules
export const createQueryParsers = <T extends Record<string, unknown>>(additionalParsers?: T) => ({
    ...baseQueryParsers,
    ...additionalParsers,
});

// Common parsers for boolean filters
export const booleanParser = parseAsBoolean;
export const stringParser = parseAsString;
export const intParser = parseAsInteger;

/**
 * Hook to manage base query filters via URL
 * @param additionalParsers - Additional parsers for module-specific filters
 * @returns [query, setQuery] - Current query state and setter function
 */
export function useQueryFilters<T extends Record<string, unknown>>(additionalParsers?: T) {
    const parsers = createQueryParsers(additionalParsers);
    return useQueryStates(parsers, {
        history: "push",
    });
}

/**
 * Convert nuqs query state to BaseQuery interface
 * Filters out empty strings and undefined values
 */
export function toQueryParams<T extends BaseQuery>(query: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ) as Partial<T>;
}
