import { useEffect } from "react";

import {
  getStaleTabResultCache,
  setStaleTabResultCache,
} from "@/lib/staleTabResultCache";

/** Convex `usePaginatedQuery` status values we branch on. */
type PaginatedStatus =
  | "LoadingFirstPage"
  | "LoadingMore"
  | "CanLoadMore"
  | "Exhausted";

export { clearStaleTabResultCache as clearStaleTabResultsCache } from "@/lib/staleTabResultCache";

/**
 * When query args change (e.g. category tab), Convex refetches from page one.
 * Keep the last loaded pages per tab so revisits do not shrink or flash empty.
 * After a revisit, silently call `loadMore` until the live query catches up.
 */
export function useStaleTabResults<T>(
  tabKey: string,
  status: PaginatedStatus,
  items: T[],
  loadMore?: (numItems: number) => void,
  pageSize?: number,
) {
  useEffect(() => {
    if (status === "LoadingFirstPage") {
      return;
    }

    const cached = getStaleTabResultCache<T>(tabKey);
    if (cached && items.length < cached.length && status !== "Exhausted") {
      return;
    }

    setStaleTabResultCache(tabKey, items);
  }, [tabKey, status, items]);

  useEffect(() => {
    if (!loadMore || pageSize === undefined) {
      return;
    }
    if (status !== "CanLoadMore") {
      return;
    }

    const cached = getStaleTabResultCache<T>(tabKey);
    if (!cached || items.length >= cached.length) {
      return;
    }

    loadMore(pageSize);
  }, [tabKey, status, items.length, loadMore, pageSize]);

  const cached = getStaleTabResultCache<T>(tabKey);
  const isInitialLoad = status === "LoadingFirstPage" && cached === undefined;
  const isRefreshing = status === "LoadingFirstPage" && cached !== undefined;

  const isBehindCached =
    cached !== undefined &&
    items.length < cached.length &&
    status !== "Exhausted";

  const displayItems =
    status === "LoadingFirstPage" && cached !== undefined
      ? cached
      : isBehindCached
        ? cached
        : items;

  const isSyncingPagination =
    isBehindCached &&
    (status === "CanLoadMore" || status === "LoadingMore");

  return { displayItems, isInitialLoad, isRefreshing, isSyncingPagination };
}
