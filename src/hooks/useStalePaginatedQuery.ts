"use client";

import { useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import type { PaginatedQueryReference } from "convex/react";

import {
  type PaginatedQueryStatus,
  useStaleTabResults,
} from "@/hooks/useStaleTabResults";

export function paginatedCanLoadMore(
  status: PaginatedQueryStatus,
  isRefreshing: boolean,
  isSyncingPagination: boolean,
): boolean {
  return (
    !isRefreshing &&
    !isSyncingPagination &&
    status === "CanLoadMore"
  );
}

/** Convex paginated query with per-tab stale result cache (board filters, …). */
export function useStalePaginatedQuery<Item>(
  query: PaginatedQueryReference,
  queryArgs: Record<string, unknown> | "skip",
  tabKey: string,
  pageSize: number,
) {
  const {
    results,
    status,
    loadMore: loadMoreRaw,
  } = usePaginatedQuery(query, queryArgs, {
    initialNumItems: pageSize,
  });

  const liveItems = results as Item[];

  const {
    displayItems,
    isInitialLoad,
    isRefreshing,
    isSyncingPagination,
  } = useStaleTabResults(
    tabKey,
    status,
    liveItems,
    loadMoreRaw,
    pageSize,
  );

  const loadMore = useCallback(() => {
    loadMoreRaw(pageSize);
  }, [loadMoreRaw, pageSize]);

  const loadingMore = status === "LoadingMore";

  return {
    displayItems,
    liveItems,
    status,
    isInitialLoad,
    isRefreshing,
    isSyncingPagination,
    loadMore,
    loadingMore,
  };
}
