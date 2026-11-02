import { Pause, Pencil, Radio, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  Button,
  IconButton,
  LIST_ROW_META_TEXT_CLASS,
  ListRow,
  ListRowMetaSeparator,
  buttonClassName,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import { LOANS_COPY } from "@/features/loans";
import {
  BORROW_DUE_TONE_CLASS,
  formatBorrowDuePhrase,
  getBorrowDueUrgency,
} from "@/lib/format-borrow-due";
import { cn } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";

import { TOOLS_COPY } from "../constants/copy";
import { TOOL_CATEGORY_LABELS, TOOL_CONDITION_LABELS } from "../constants/labels";
import { TOOLS_ICON_CLASS } from "../constants/visual";
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
  const listingState = isLive ? "on_board" : isOnLoan ? "on_loan" : "paused";
  const canToggleAvailability = isLive || !isOnLoan;
  const listingLocked = isOnLoan;
  const lockedTooltip = TOOLS_COPY.listingLockedActiveLoan;
  const activeLoan = tool.activeLoan;
  const duePhrase =
    activeLoan !== undefined ? formatBorrowDuePhrase(activeLoan.endDate) : null;
  const dueUrgency =
    activeLoan !== undefined ? getBorrowDueUrgency(activeLoan.endDate) : null;
  const isMuted = !isLive && !isOnLoan && !hasRequests;
  const showMarkReturned = activeLoan !== undefined && onMarkReturned != null;
  const hasLoanLine = Boolean(activeLoan && duePhrase && dueUrgency);
  const hasDetails = hasLoanLine || hasRequests;
  const hasPrimaryActions = hasRequests || showMarkReturned;

  return (
    <ListRow
      className={className}
      title={tool.name}
      titleClassName={cn(
        "transition-opacity",
        isMuted && "text-ink-muted opacity-55",
      )}
      headerActions={
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
            aria-label={isLive ? TOOLS_COPY.pauseListing : TOOLS_COPY.putOnBoard}
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
      }
      metaClassName={cn("transition-opacity", isMuted && "opacity-55")}
      meta={
        <>
          <ToolListingStateBadge state={listingState} />
          <ListRowMetaSeparator />
          <span>
            {TOOL_CATEGORY_LABELS[tool.category]} ·{" "}
            {TOOL_CONDITION_LABELS[tool.condition]}
          </span>
        </>
      }
      details={
        hasDetails ? (
          <div className="space-y-1">
            {activeLoan && duePhrase && dueUrgency ? (
              <p className={LIST_ROW_META_TEXT_CLASS}>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {LOANS_COPY.borrowedBy(activeLoan.borrowerName)}
                </span>
                <ListRowMetaSeparator />
                <span className={cn("shrink-0", BORROW_DUE_TONE_CLASS[dueUrgency])}>
                  {duePhrase}
                </span>
              </p>
            ) : null}
            {hasRequests ? (
              <p className="text-xs font-semibold text-ink">
                {TOOLS_COPY.listingRequestsNotice(tool.pendingRequestCount)}
              </p>
            ) : null}
          </div>
        ) : undefined
      }
      actions={
        hasPrimaryActions ? (
          <>
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
            {showMarkReturned && activeLoan ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={markReturnedPendingId === activeLoan.requestId}
                onClick={() => onMarkReturned(activeLoan.requestId, tool.name)}
              >
                {LOANS_COPY.markReturned}
              </Button>
            ) : null}
          </>
        ) : undefined
      }
    />
  );
}
