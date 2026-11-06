"use client";

import { useCallback, useMemo, useState } from "react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import type { ToolCategoryKey } from "../constants/labels";

export type ToolFilterQueryArgs = {
  category?: ToolCategoryKey;
  search?: string;
};

export function useToolFilters() {
  const [categoryFilter, setCategoryFilter] = useState<
    ToolCategoryKey | "all"
  >("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);

  const debouncedSearchTrimmed = debouncedSearch.trim();
  const searchTrimmed = search.trim();

  const isIdle = categoryFilter === "all" && searchTrimmed === "";
  const isSearchPending = searchTrimmed !== debouncedSearchTrimmed;

  /**
   * Search string sent to Convex: debounced value when it has caught up, otherwise the live
   * trimmed input so we never call `listPublic` / `listBoard` with `{}` while the box has text
   * (that used to load the full unfiltered pool, e.g. 36 teaser rows on `/`).
   */
  const searchForQuery =
    searchTrimmed === ""
      ? undefined
      : debouncedSearchTrimmed !== ""
        ? debouncedSearchTrimmed
        : searchTrimmed;

  const queryArgs = useMemo((): ToolFilterQueryArgs => {
    const args: ToolFilterQueryArgs = {};
    if (categoryFilter !== "all") {
      args.category = categoryFilter;
    }
    if (searchForQuery !== undefined) {
      args.search = searchForQuery;
    }
    return args;
  }, [categoryFilter, searchForQuery]);

  const filterKey = `${categoryFilter}:${debouncedSearchTrimmed}`;

  const reset = useCallback(() => {
    setCategoryFilter("all");
    setSearch("");
  }, []);

  return {
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    debouncedSearch,
    debouncedSearchTrimmed,
    isIdle,
    isSearchPending,
    queryArgs,
    filterKey,
    reset,
  };
}
