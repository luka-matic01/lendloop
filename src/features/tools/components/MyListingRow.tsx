import { Pencil, Pause, Radio, Trash2 } from "lucide-react";
import Link from "next/link";

import { IconButton } from "@/components/ui";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

import { TOOLS_COPY } from "../constants/copy";
import { TOOL_CATEGORY_LABELS, TOOL_CONDITION_LABELS } from "../constants/labels";
import {
  TOOLS_ICON_CLASS,
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
  const isOnLoan = tool.hasActiveLoan;
  const listingState = isLive
    ? "on_board"
    : isOnLoan
      ? "on_loan"
      : "paused";
  const canToggleAvailability = isLive || !isOnLoan;
  const listingLocked = isOnLoan;
  const lockedTooltip = TOOLS_COPY.listingLockedActiveLoan;

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
          {tool.pendingRequestCount > 0 ? (
            <Link
              href={ROUTES.loans}
              className="text-xs font-semibold text-positive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              aria-label={TOOLS_COPY.listingRequestsLinkAria(
                tool.pendingRequestCount,
                tool.name,
              )}
            >
              {TOOLS_COPY.listingRequestsLink(tool.pendingRequestCount)}
            </Link>
          ) : null}
        </div>
      </div>

      <div
        role="group"
        aria-label={TOOLS_COPY.listingActionsLabel}
        className="flex shrink-0 items-center gap-1"
      >
          <IconButton
            type="button"
            variant="ghost"
            aria-label={TOOLS_COPY.editListing}
            tooltip={listingLocked ? lockedTooltip : undefined}
            disabled={listingLocked}
            onClick={onEdit}
            className="hover:bg-canvas disabled:pointer-events-none disabled:opacity-40"
          >
            <Pencil className={TOOLS_ICON_CLASS} aria-hidden />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            aria-label={
              isLive
                ? TOOLS_COPY.pauseListing
                : TOOLS_COPY.putOnBoard
            }
            tooltip={
              !canToggleAvailability
                ? TOOLS_COPY.putOnBoardBlockedActiveLoan
                : undefined
            }
            disabled={!canToggleAvailability}
            onClick={onToggleAvailability}
            className="hover:bg-canvas disabled:pointer-events-none disabled:opacity-40"
          >
            {isLive ? (
              <Pause className={TOOLS_ICON_CLASS} aria-hidden />
            ) : (
              <Radio className={TOOLS_ICON_CLASS} aria-hidden />
            )}
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            aria-label={TOOLS_COPY.removeListing}
            tooltip={listingLocked ? lockedTooltip : undefined}
            disabled={listingLocked}
            onClick={onRemove}
            className="text-ink-muted hover:bg-canvas hover:text-negative disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className={TOOLS_ICON_CLASS} aria-hidden />
          </IconButton>
      </div>
    </div>
  );
}
