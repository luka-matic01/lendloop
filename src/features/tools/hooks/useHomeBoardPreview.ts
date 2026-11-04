"use client";

import { useMemo } from "react";

import { usePaginatedQuery } from "convex/react";

import { api } from "convex/_generated/api";

import { HOME_BOARD_PAGE_SIZE } from "../constants/pagination";
import type { BoardTool } from "../types/tools";
import { pickHomeBoardPreview } from "../utils/pickHomeBoardPreview";

/** First page of the neighbor board, trimmed for the home teaser grid. */
export function useHomeBoardPreview(isReady: boolean) {
  const { results: boardTools, status: boardStatus } = usePaginatedQuery(
    api.tools.listBoard,
    isReady ? {} : "skip",
    { initialNumItems: HOME_BOARD_PAGE_SIZE },
  );

  const isLoading = !isReady || boardStatus === "LoadingFirstPage";

  const preview = useMemo(
    () => pickHomeBoardPreview(boardTools as BoardTool[]),
    [boardTools],
  );

  return { preview, isLoading };
}
