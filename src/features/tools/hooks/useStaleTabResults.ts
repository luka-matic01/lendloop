import { useEffect, useRef } from "react";

/** Convex `usePaginatedQuery` status values we branch on. */
type PaginatedStatus =
  | "LoadingFirstPage"
  | "LoadingMore"
  | "CanLoadMore"
  | "Exhausted";

/**
 * When query args change (e.g. category tab), Convex refetches from page one.
 * Keep the last successful page per tab so revisits do not flash a skeleton.
 */
export function useStaleTabResults<T>(
  tabKey: string,
  status: PaginatedStatus,
  items: T[],
) {
  const byTab = useRef(new Map<string, T[]>());

  useEffect(() => {
    if (status === "LoadingFirstPage") {
      return;
    }
    byTab.current.set(tabKey, items);
  }, [tabKey, status, items]);

  const cached = byTab.current.get(tabKey);
  const isInitialLoad = status === "LoadingFirstPage" && cached === undefined;
  const isRefreshing = status === "LoadingFirstPage" && cached !== undefined;
  const displayItems =
    status === "LoadingFirstPage" && cached !== undefined ? cached : items;

  return { displayItems, isInitialLoad, isRefreshing };
}
