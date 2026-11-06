"use client";

import { Panel } from "@/components/ui";
import { useHoldoverRowsDuringRefetch } from "@/hooks/useHoldoverRowsDuringRefetch";
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
import { useToolFilters } from "../hooks/useToolFilters";
import type { useListingActions } from "../hooks/useListingActions";
import type { BoardTool } from "../types/tools";
import type { RequestTrustedLenderChange } from "../utils/neighborToolTrust";
import { NeighborToolCard } from "./NeighborToolCard";
import { ToolFilterToolbar } from "./ToolFilterToolbar";
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
  hasSearch: boolean,
): string {
  if (boardIsEmpty) {
    return TOOLS_COPY.emptyBoard;
  }
  if (hasSearch) {
    return TOOLS_COPY.emptySearch;
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

  const {
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    debouncedSearchTrimmed,
    queryArgs,
    filterKey,
    reset,
  } = useToolFilters();

  const filterToolbar = (
    <ToolFilterToolbar
      idPrefix="board"
      search={search}
      onSearchChange={setSearch}
      categoryFilter={categoryFilter}
      onCategoryChange={setCategoryFilter}
      onReset={reset}
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
    isReady ? queryArgs : "skip",
    filterKey,
    BOARD_PAGE_SIZE,
  );

  const loadingFirstPageEmpty =
    boardStatus === "LoadingFirstPage" && tools.length === 0;
  const { rowsToShow: displayTools, isHoldover: showHoldoverWhileLoading } =
    useHoldoverRowsDuringRefetch(tools, loadingFirstPageEmpty);

  const boardIsEmpty =
    boardStatus !== "LoadingFirstPage" &&
    boardTools.length === 0 &&
    boardStatus === "Exhausted";
  const neighborTotalOnBoard = displayTools.length;
  const isLoading =
    displayTools.length === 0 && (!isReady || isInitialLoad);
  const isRefreshing =
    neighborBoardRefreshing || neighborBoardSyncingPagination;

  const canLoadMore = paginatedCanLoadMore(
    boardStatus,
    neighborBoardRefreshing,
    neighborBoardSyncingPagination,
  );

  const showNeighborEmpty =
    !isLoading && displayTools.length === 0 && !canLoadMore;
  const emptyMessage = neighborEmptyMessage(
    boardIsEmpty,
    neighborTotalOnBoard,
    categoryFilter,
    debouncedSearchTrimmed !== "",
  );

  return (
    <ToolsSection
      headingId="browse-neighbors-heading"
      heading={TOOLS_COPY.browseSectionLabel}
      toolbar={filterToolbar}
      busy={isLoading || (isRefreshing && !showHoldoverWhileLoading)}
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
      {displayTools.length > 0 ? (
        <div
          className={
            showHoldoverWhileLoading
              ? "opacity-60 transition-opacity duration-150"
              : undefined
          }
          aria-busy={showHoldoverWhileLoading || undefined}
        >
          <ul className={TOOL_CARD_GRID_CLASS}>
            {displayTools.map((tool) => (
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
        </div>
      ) : null}
    </ToolsSection>
  );
}
