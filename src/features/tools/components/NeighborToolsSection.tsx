import { Button, Panel } from "@/components/ui";
import type { Id } from "convex/_generated/dataModel";

import { TOOLS_COPY } from "../constants/copy";
import type { RequestTrustedLenderChange } from "../utils/neighborToolTrust";
import type { ToolCategoryKey } from "../constants/labels";
import {
  NEIGHBOR_BOARD_SKELETON_COUNT,
  TOOL_CARD_GRID_CLASS,
} from "../constants/visual";
import type { BoardTool } from "../types/tools";
import { neighborToolTrustCardProps } from "../utils/neighborToolTrust";
import { ToolCard } from "./ToolCard";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ToolCardSkeletonGrid } from "./ToolSkeletons";

type NeighborToolsSectionProps = {
  tools: BoardTool[];
  boardIsEmpty: boolean;
  neighborTotalOnBoard: number;
  categoryFilter: ToolCategoryKey | "all";
  onCategoryChange: (value: ToolCategoryKey | "all") => void;
  onRemoveTool: (tool: BoardTool) => void;
  onBorrowTool: (tool: BoardTool) => void;
  requestTrustedLenderChange?: RequestTrustedLenderChange;
  pendingTrustedUserId?: Id<"users"> | null;
  canLoadMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
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
  tools,
  boardIsEmpty,
  neighborTotalOnBoard,
  categoryFilter,
  onCategoryChange,
  onRemoveTool,
  onBorrowTool,
  requestTrustedLenderChange,
  pendingTrustedUserId = null,
  canLoadMore = false,
  loadingMore = false,
  onLoadMore,
  isLoading = false,
  isRefreshing = false,
}: NeighborToolsSectionProps) {
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
        onChange={onCategoryChange}
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
                    onRemove={() => onRemoveTool(tool)}
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
          {canLoadMore && onLoadMore ? (
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
