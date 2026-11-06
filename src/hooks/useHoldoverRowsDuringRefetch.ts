"use client";

import { useEffect, useState } from "react";

/**
 * When a refetch briefly returns no rows (e.g. Convex `LoadingFirstPage` with an empty page),
 * keep rendering the last non-empty result so the grid height does not jump.
 */
export function useHoldoverRowsDuringRefetch<T>(
  rows: T[],
  loadingEmpty: boolean,
): { rowsToShow: T[]; isHoldover: boolean } {
  const [snapshot, setSnapshot] = useState<T[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      if (rows.length > 0) {
        setSnapshot(rows);
      } else if (!loadingEmpty) {
        setSnapshot([]);
      }
    });
  }, [rows, loadingEmpty]);

  const isHoldover = loadingEmpty && rows.length === 0 && snapshot.length > 0;
  const rowsToShow = isHoldover ? snapshot : rows;

  return { rowsToShow, isHoldover };
}
