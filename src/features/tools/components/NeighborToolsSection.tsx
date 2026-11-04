"use client";

import { useCallback, useState } from "react";
import { usePaginatedQuery } from "convex/react";

import { Button, Panel } from "@/components/ui";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { TOOLS_COPY } from "../constants/copy";
import type { ToolCategoryKey } from "../constants/labels";
import { BOARD_PAGE_SIZE } from "../constants/pagination";
import {
  NEIGHBOR_BOARD_SKELETON_COUNT,
  TOOL_CARD_GRID_CLASS,
} from "../constants/visual";
import type { useListingActions } from "../hooks/useListingActions";
import { useStaleTabResults } from "../hooks/useStaleTabResults";
import type { BoardTool } from "../types/tools";
import type { RequestTrustedLenderChange } from "../utils/neighborToolTrust";
import { neighborToolTrustCardProps } from "../utils/neighborToolTrust";
import { ToolCard } from "./ToolCard";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ToolCardSkeletonGrid } from "./ToolSkeletons";

type NeighborToolsSectionProps = {
  isReady: boolean;
  listingActions: ReturnType<typeof useListingActions>;
  onBorrowTool: (tool: BoardTool) => void;
  requestTrustedLenderChange?: RequestTrustedLenderChange;
  pendingTrustedUserId?: Id<"users"> | null;
};

function neighborEmptyMessage(
  boardIsEmpty: boolean,
  neighborTotalOnBoard: number,
  categoryFilter: ToolCategoryKey | "all",
): string {
  if (boardIsEmpty) {
    return TOOLS_COPY.emptyBoard;
  }
  if (categoryFilter !== "all") {
    return TOOLS_COPY.emptyNeighborsCategory;
  }
  if (neighborTotalOnBoard === 0) {
    return TOOLS_COPY.emptyNeighborsBoard;
  }
  return TOOLS_COPY.emptyNeighborsCategory;
}

export function NeighborToolsSection({
  isReady,
  listingActions,
  onBorrowTool,
  requestTrustedLenderChange,
  pendingTrustedUserId = null,
}: NeighborToolsSectionProps) {
  const { requestRemoveListing } = listingActions;

  const [categoryFilter, setCategoryFilter] = useState<
    ToolCategoryKey | "all"
  >("all");
  const boardCategory =
    categoryFilter === "all" ? undefined : categoryFilter;

  const {
    results: boardTools,
    status: boardStatus,
    loadMore: loadMoreBoard,
  } = usePaginatedQuery(
    api.tools.listBoard,
    isReady ? { category: boardCategory } : "skip",
    { initialNumItems: BOARD_PAGE_SIZE },
  );

  const {
    displayItems: tools,
    isInitialLoad,
    isRefreshing: neighborBoardRefreshing,
    isSyncingPagination: neighborBoardSyncingPagination,
  } = useStaleTabResults(
    categoryFilter,
    boardStatus,
    boardTools,
    loadMoreBoard,
    BOARD_PAGE_SIZE,
  );

  const boardIsEmpty =
    boardStatus !== "LoadingFirstPage" &&
    boardTools.length === 0 &&
    boardStatus === "Exhausted";
  const neighborTotalOnBoard = tools.length;
  const isLoading =
    tools.length === 0 && (!isReady || isInitialLoad);
  const isRefreshing =
    neighborBoardRefreshing || neighborBoardSyncingPagination;

  const canLoadMore =
    !neighborBoardRefreshing &&
    !neighborBoardSyncingPagination &&
    boardStatus === "CanLoadMore";
  const loadingMore = boardStatus === "LoadingMore";

  const onLoadMore = useCallback(() => {
    loadMoreBoard(BOARD_PAGE_SIZE);
  }, [loadMoreBoard]);

  const showNeighborEmpty =
    !isLoading && tools.length === 0 && !canLoadMore;
  const emptyMessage = neighborEmptyMessage(
    boardIsEmpty,
    neighborTotalOnBoard,
    categoryFilter,
  );

  return (
    <section
      aria-labelledby="browse-neighbors-heading"
      aria-busy={isLoading || isRefreshing || undefined}
      className="space-y-4"
    >
      <h2
        id="browse-neighbors-heading"
        className="font-display text-2xl font-bold leading-none text-ink"
      >
        {TOOLS_COPY.browseSectionLabel}
      </h2>

      <CategoryFilterBar
        value={categoryFilter}
        onChange={setCategoryFilter}
      />

      {isLoading ? (
        <ToolCardSkeletonGrid
          count={NEIGHBOR_BOARD_SKELETON_COUNT}
          label="Loading tools on the board"
        />
      ) : showNeighborEmpty ? (
        <Panel>
          <p className="text-sm text-ink-muted">{emptyMessage}</p>
        </Panel>
      ) : (
        <>
          {tools.length > 0 ? (
            <ul className={TOOL_CARD_GRID_CLASS}>
              {tools.map((tool) => (
                <li key={tool._id} className="min-h-0">
                  <ToolCard
                    tool={tool}
                    onBorrow={() => onBorrowTool(tool)}
                    onRemove={() => requestRemoveListing(tool)}
                    {...(requestTrustedLenderChange
                      ? neighborToolTrustCardProps(
                          tool,
                          requestTrustedLenderChange,
                          pendingTrustedUserId,
                        )
                      : {})}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {canLoadMore ? (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={loadingMore}
                onClick={onLoadMore}
              >
                {loadingMore
                  ? TOOLS_COPY.loadingMore
                  : TOOLS_COPY.loadMoreBoard}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
