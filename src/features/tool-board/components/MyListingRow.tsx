import { Pencil, Pause, Radio, Trash2 } from "lucide-react";

import { IconButton } from "@/components/ui";
import { cn } from "@/lib/utils";

import { TOOL_BOARD_COPY } from "../constants/copy";
import { TOOL_CATEGORY_LABELS, TOOL_CONDITION_LABELS } from "../constants/labels";
import {
  TOOL_BOARD_ICON_CLASS,
  TOOL_LISTING_ROW_TITLE_CLASS,
} from "../constants/visual";
import type { MyTool } from "../types/tools";
import { ToolListingStateBadge } from "./ToolCardMeta";

type MyListingRowProps = {
  tool: MyTool;
  onEdit: () => void;
  onToggleAvailability: () => void;
  onRemove: () => void;
  className?: string;
};

export function MyListingRow({
  tool,
  onEdit,
  onToggleAvailability,
  onRemove,
  className,
}: MyListingRowProps) {
  const isLive = tool.isAvailable;
  const listingState = isLive ? "on_board" : "paused";

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3 sm:items-center sm:gap-4 sm:py-3.5",
        className,
      )}
    >
      <div
        className={cn(
          "min-w-0 flex-1 transition-opacity",
          !isLive && "opacity-45",
        )}
      >
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
          <ToolListingStateBadge state={listingState} />
        </div>
      </div>

      <div
        role="group"
        aria-label={TOOL_BOARD_COPY.listingActionsLabel}
        className="flex shrink-0 items-center gap-1"
      >
          <IconButton
            type="button"
            variant="ghost"
            aria-label={TOOL_BOARD_COPY.editListing}
            onClick={onEdit}
            className="hover:bg-canvas"
          >
            <Pencil className={TOOL_BOARD_ICON_CLASS} aria-hidden />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            aria-label={
              isLive
                ? TOOL_BOARD_COPY.pauseListing
                : TOOL_BOARD_COPY.putOnBoard
            }
            onClick={onToggleAvailability}
            className="hover:bg-canvas"
          >
            {isLive ? (
              <Pause className={TOOL_BOARD_ICON_CLASS} aria-hidden />
            ) : (
              <Radio className={TOOL_BOARD_ICON_CLASS} aria-hidden />
            )}
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            aria-label={TOOL_BOARD_COPY.removeListing}
            onClick={onRemove}
            className="text-ink-muted hover:bg-canvas hover:text-negative"
          >
            <Trash2 className={TOOL_BOARD_ICON_CLASS} aria-hidden />
          </IconButton>
      </div>
    </div>
  );
}
