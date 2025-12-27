import type { SortOrder } from "@/common/types";
import type { SortOrder as AntdSortOrder } from "antd/es/table/interface";
import type { ColumnType } from "antd/lib/table";

/**
 * Helper to get Antd table sort order from query state
 * @param sortBy - Current sortBy value from query
 * @param sort_order - Current sort_order value from query
 * @param field - Column field name to check
 * @returns Antd sort order or undefined
 */
export const getSortOrder = (
    sortBy: string | undefined,
    sortOrder: SortOrder | undefined,
    field: string
): AntdSortOrder | undefined => {
    if (sortBy === field) {
        return sortOrder === "asc" ? "ascend" : "descend";
    }
    return undefined;
};

export const setSortOrder = (sort: ColumnType["sortOrder"]) => {
    if (sort === "ascend") return "asc";
    if (sort === "descend") return "desc";
    return undefined;
};
