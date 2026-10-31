import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

import { TOOL_BOARD_COPY } from "../constants/copy";
import { TOOL_CATEGORY_LABELS, TOOL_CONDITION_LABELS } from "../constants/labels";
import { TOOL_LISTING_ROW_TITLE_CLASS } from "../constants/visual";
import type { MyTool } from "../types/tools";
import { ToolListingStateBadge } from "./ToolCardMeta";

type MyListingRowProps = {
  tool: MyTool;
  onToggleAvailability: () => void;
  onRemove: () => void;
  className?: string;
};

export function MyListingRow({
  tool,
  onToggleAvailability,
  onRemove,
  className,
}: MyListingRowProps) {
  const isLive = tool.isAvailable;
  const listingState = isLive ? "on_board" : "paused";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3.5",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            TOOL_LISTING_ROW_TITLE_CLASS,
            !isLive && "text-ink-muted",
          )}
        >
          {tool.name}
        </p>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="min-w-0 text-xs font-semibold text-ink-muted">
            {TOOL_CATEGORY_LABELS[tool.category]}
            <span aria-hidden> · </span>
            {TOOL_CONDITION_LABELS[tool.condition]}
          </p>
          <ToolListingStateBadge state={listingState} iconOnly />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onToggleAvailability}
        >
          {isLive
            ? TOOL_BOARD_COPY.pauseListing
            : TOOL_BOARD_COPY.putOnBoard}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-ink-muted hover:text-negative"
        >
          {TOOL_BOARD_COPY.removeListing}
        </Button>
      </div>
    </div>
  );
}
