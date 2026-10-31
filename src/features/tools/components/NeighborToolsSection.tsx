import { Panel } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import type { ToolCategoryKey } from "../constants/labels";
import { TOOL_CARD_GRID_CLASS } from "../constants/visual";
import type { BoardTool } from "../types/tools";
import { ToolCard } from "./ToolCard";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { ToolCardSkeletonGrid } from "./ToolSkeletons";

type NeighborToolsSectionProps = {
  tools: BoardTool[];
  totalOnBoard: number;
  neighborTotalOnBoard: number;
  categoryFilter: ToolCategoryKey | "all";
  onCategoryChange: (value: ToolCategoryKey | "all") => void;
  onRemoveTool: (tool: BoardTool) => void;
  onBorrowTool: (tool: BoardTool) => void;
  isLoading?: boolean;
};

function neighborEmptyMessage(
  totalOnBoard: number,
  neighborTotalOnBoard: number,
  categoryFilter: ToolCategoryKey | "all",
): string {
  if (totalOnBoard === 0) {
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
  totalOnBoard,
  neighborTotalOnBoard,
  categoryFilter,
  onCategoryChange,
  onRemoveTool,
  onBorrowTool,
  isLoading = false,
}: NeighborToolsSectionProps) {
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
        {TOOLS_COPY.browseSectionLabel}
      </h2>

      <CategoryFilterBar
        value={categoryFilter}
        onChange={onCategoryChange}
      />

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
              <ToolCard
                tool={tool}
                onBorrow={() => onBorrowTool(tool)}
                onRemove={() => onRemoveTool(tool)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
