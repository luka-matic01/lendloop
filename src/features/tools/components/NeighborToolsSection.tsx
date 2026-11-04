"use client";

import { useState } from "react";

import { Panel } from "@/components/ui";
import {
  paginatedCanLoadMore,
  useStalePaginatedQuery,
} from "@/hooks/useStalePaginatedQuery";
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
import type { BoardTool } from "../types/tools";
import type { RequestTrustedLenderChange } from "../utils/neighborToolTrust";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { NeighborToolCard } from "./NeighborToolCard";
import { ToolsSection } from "./ToolsSection";
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

  const categoryToolbar = (
    <CategoryFilterBar
      value={categoryFilter}
      onChange={setCategoryFilter}
    />
  );

  const {
    displayItems: tools,
    liveItems: boardTools,
    status: boardStatus,
    isInitialLoad,
    isRefreshing: neighborBoardRefreshing,
    isSyncingPagination: neighborBoardSyncingPagination,
    loadMore,
    loadingMore,
  } = useStalePaginatedQuery<BoardTool>(
    api.tools.listBoard,
    isReady ? { category: boardCategory } : "skip",
    categoryFilter,
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

  const canLoadMore = paginatedCanLoadMore(
    boardStatus,
    neighborBoardRefreshing,
    neighborBoardSyncingPagination,
  );

  const showNeighborEmpty =
    !isLoading && tools.length === 0 && !canLoadMore;
  const emptyMessage = neighborEmptyMessage(
    boardIsEmpty,
    neighborTotalOnBoard,
    categoryFilter,
  );

  return (
    <ToolsSection
      headingId="browse-neighbors-heading"
      heading={TOOLS_COPY.browseSectionLabel}
      toolbar={categoryToolbar}
      busy={isLoading || isRefreshing}
      isLoading={isLoading}
      loading={
        <ToolCardSkeletonGrid
          count={NEIGHBOR_BOARD_SKELETON_COUNT}
          label="Loading tools on the board"
        />
      }
      isEmpty={showNeighborEmpty}
      empty={
        <Panel>
          <p className="text-sm text-ink-muted">{emptyMessage}</p>
        </Panel>
      }
      loadMore={{
        canLoadMore,
        loadingMore,
        onLoadMore: loadMore,
        label: TOOLS_COPY.loadMoreBoard,
        loadingLabel: TOOLS_COPY.loadingMore,
      }}
    >
      {tools.length > 0 ? (
        <ul className={TOOL_CARD_GRID_CLASS}>
          {tools.map((tool) => (
            <li key={tool._id} className="min-h-0">
              <NeighborToolCard
                tool={tool}
                onBorrow={() => onBorrowTool(tool)}
                onRemove={() => requestRemoveListing(tool)}
                requestTrustedLenderChange={requestTrustedLenderChange}
                pendingTrustedUserId={pendingTrustedUserId}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </ToolsSection>
  );
}
