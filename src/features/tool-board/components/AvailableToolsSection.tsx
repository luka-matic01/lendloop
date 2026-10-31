import { Panel } from "@/components/ui";

import { TOOL_BOARD_COPY } from "../constants/copy";
import type { ToolCategoryKey } from "../constants/labels";
import { TOOL_CARD_GRID_CLASS } from "../constants/visual";
import type { BoardTool } from "../types/tools";
import { BoardToolCard } from "./BoardToolCard";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ToolCardSkeletonGrid } from "./ToolBoardSkeletons";

type AvailableToolsSectionProps = {
  tools: BoardTool[];
  totalOnBoard: number;
  neighborTotalOnBoard: number;
  myLiveOnBoardCount: number;
  categoryFilter: ToolCategoryKey | "all";
  onCategoryChange: (value: ToolCategoryKey | "all") => void;
  onRemoveTool: (tool: BoardTool) => void;
  isLoading?: boolean;
};

function neighborEmptyMessage(
  totalOnBoard: number,
  neighborTotalOnBoard: number,
  categoryFilter: ToolCategoryKey | "all",
): string {
  if (totalOnBoard === 0) {
    return TOOL_BOARD_COPY.emptyBoard;
  }
  if (categoryFilter !== "all") {
    return TOOL_BOARD_COPY.emptyNeighborsCategory;
  }
  if (neighborTotalOnBoard === 0) {
    return TOOL_BOARD_COPY.emptyNeighborsBoard;
  }
  return TOOL_BOARD_COPY.emptyNeighborsCategory;
}

export function AvailableToolsSection({
  tools,
  totalOnBoard,
  neighborTotalOnBoard,
  myLiveOnBoardCount,
  categoryFilter,
  onCategoryChange,
  onRemoveTool,
  isLoading = false,
}: AvailableToolsSectionProps) {
  const emptyMessage = neighborEmptyMessage(
    totalOnBoard,
    neighborTotalOnBoard,
    categoryFilter,
  );

  return (
    <section
      aria-labelledby="browse-neighbors-heading"
      aria-busy={isLoading || undefined}
      className="space-y-4"
    >
      <h2
        id="browse-neighbors-heading"
        className="font-display text-2xl font-bold leading-none text-ink"
      >
        {TOOL_BOARD_COPY.browseSectionLabel}
      </h2>

      <CategoryFilterBar
        value={categoryFilter}
        onChange={onCategoryChange}
      />

      {!isLoading && myLiveOnBoardCount > 0 ? (
        <p className="text-sm text-ink-muted">
          <a
            href="#listings-heading"
            className="font-semibold text-board underline-offset-2 hover:underline"
          >
            {TOOL_BOARD_COPY.manageOwnOnBoard(myLiveOnBoardCount)}
          </a>
        </p>
      ) : null}

      {isLoading ? (
        <ToolCardSkeletonGrid label="Loading tools on the board" />
      ) : tools.length === 0 ? (
        <Panel>
          <p className="text-sm text-ink-muted">{emptyMessage}</p>
        </Panel>
      ) : (
        <ul className={TOOL_CARD_GRID_CLASS}>
          {tools.map((tool) => (
            <li key={tool._id} className="min-h-0">
              <BoardToolCard
                tool={tool}
                onRemove={() => onRemoveTool(tool)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
