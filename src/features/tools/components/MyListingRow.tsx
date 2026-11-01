import { Pause, Pencil, Radio, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button, IconButton, buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";
import { LOANS_COPY } from "@/features/loans/constants/copy";
import {
  BORROW_DUE_TONE_CLASS,
  formatBorrowDuePhrase,
  getBorrowDueUrgency,
} from "@/lib/format-borrow-due";
import { cn } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";

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
  markReturnedPendingId?: Id<"loanRequests"> | null;
  onMarkReturned?: (requestId: Id<"loanRequests">, toolName: string) => void;
  className?: string;
};

export function MyListingRow({
  tool,
  onEdit,
  onToggleAvailability,
  onRemove,
  markReturnedPendingId = null,
  onMarkReturned,
  className,
}: MyListingRowProps) {
  const isLive = tool.isAvailable;
  const isOnLoan = tool.hasActiveLoan;
  const hasRequests = tool.pendingRequestCount > 0;
  const listingState = isLive
    ? "on_board"
    : isOnLoan
      ? "on_loan"
      : "paused";
  const canToggleAvailability = isLive || !isOnLoan;
  const listingLocked = isOnLoan;
  const lockedTooltip = TOOLS_COPY.listingLockedActiveLoan;
  const activeLoan = tool.activeLoan;
  const duePhrase =
    activeLoan !== undefined
      ? formatBorrowDuePhrase(activeLoan.endDate)
      : null;
  const dueUrgency =
    activeLoan !== undefined
      ? getBorrowDueUrgency(activeLoan.endDate)
      : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3.5",
        className,
      )}
    >
      <div
        className={cn(
          "min-w-0 flex-1 transition-opacity",
          !isLive && !isOnLoan && !hasRequests && "opacity-55",
        )}
      >
        <p
          className={cn(
            TOOL_LISTING_ROW_TITLE_CLASS,
            !isLive && !isOnLoan && !hasRequests && "text-ink-muted",
          )}
        >
          {tool.name}
        </p>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-muted">
          <ToolListingStateBadge state={listingState} />
          <span aria-hidden>·</span>
          <span>
            {TOOL_CATEGORY_LABELS[tool.category]} · {TOOL_CONDITION_LABELS[tool.condition]}
          </span>
          {activeLoan && duePhrase && dueUrgency ? (
            <>
              <span aria-hidden>·</span>
              <span>{LOANS_COPY.borrowedBy(activeLoan.borrowerName)}</span>
              <span aria-hidden>·</span>
              <span className={BORROW_DUE_TONE_CLASS[dueUrgency]}>
                {duePhrase}
              </span>
            </>
          ) : null}
        </div>

        {hasRequests ? (
          <p className="mt-1.5 text-xs font-semibold text-ink">
            {TOOLS_COPY.listingRequestsNotice(tool.pendingRequestCount)}
          </p>
        ) : null}
      </div>

      <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        {hasRequests ? (
          <Link
            href={ROUTES.loans}
            className={buttonClassName({ variant: "primary", size: "sm" })}
            aria-label={TOOLS_COPY.listingRequestsLinkAria(
              tool.pendingRequestCount,
              tool.name,
            )}
          >
            {TOOLS_COPY.listingRequestsCta(tool.pendingRequestCount)}
          </Link>
        ) : null}

        {activeLoan && onMarkReturned ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={markReturnedPendingId === activeLoan.requestId}
            onClick={() =>
              onMarkReturned(activeLoan.requestId, tool.name)
            }
          >
            {LOANS_COPY.markReturned}
          </Button>
        ) : null}

        <div
          role="group"
          aria-label={TOOLS_COPY.listingActionsLabel}
          className="flex items-center gap-1"
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
    </div>
  );
}
