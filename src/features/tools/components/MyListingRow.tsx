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
  isBorrowPeriodStarted,
} from "@/lib/formatBorrowDue";
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
  const activeLoan = tool.activeLoan;
  const loanInProgress = activeLoan?.started === true;
  const loanUpcoming =
    activeLoan !== undefined &&
    !loanInProgress &&
    !isBorrowPeriodStarted(activeLoan.startDate);
  const showMarkReturned =
    activeLoan !== undefined &&
    onMarkReturned != null &&
    isBorrowPeriodStarted(activeLoan.startDate);
  const isLive = tool.isAvailable;
  const isOnLoan = loanInProgress;
  const isReserved = loanUpcoming;
  const hasRequests = tool.pendingRequestCount > 0;
  const reservationCount = tool.upcomingReservationCount;
  const listingLockedForEdit = isOnLoan || reservationCount > 0;
  const listingLockedTooltip = isOnLoan
    ? TOOLS_COPY.listingLockedActiveLoan
    : listingLockedForEdit
      ? TOOLS_COPY.listingLockedReservation
      : undefined;
  const listingState = isReserved
    ? "reserved"
    : isLive
      ? "on_board"
      : isOnLoan
        ? "on_loan"
        : "paused";
  const duePhrase =
    loanInProgress && activeLoan
      ? formatBorrowDuePhrase(activeLoan.endDate)
      : null;
  const dueUrgency =
    loanInProgress && activeLoan
      ? getBorrowDueUrgency(activeLoan.endDate)
      : null;

  return (
    <ListRow
      className={className}
      title={tool.name}
      titleClassName={cn(
        "transition-opacity",
        !isLive && !isOnLoan && !isReserved && !hasRequests && reservationCount === 0 &&
          "text-ink-muted opacity-55",
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
            tooltip={listingLockedTooltip}
            disabled={listingLockedForEdit}
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
              !isLive && isOnLoan
                ? TOOLS_COPY.putOnBoardBlockedActiveLoan
                : undefined
            }
            disabled={!isLive && isOnLoan}
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
            tooltip={listingLockedTooltip}
            disabled={listingLockedForEdit}
            onClick={onRemove}
            className="text-ink-muted hover:bg-canvas hover:text-negative disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className={TOOLS_ICON_CLASS} aria-hidden />
          </IconButton>
        </div>
      }
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
        (showMarkReturned && activeLoan) || hasRequests ? (
          <div className="space-y-1">
            {showMarkReturned && activeLoan ? (
              <p className={LIST_ROW_META_TEXT_CLASS}>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {LOANS_COPY.borrowedBy(activeLoan.borrowerName)}
                </span>
                {duePhrase && dueUrgency ? (
                  <>
                    <ListRowMetaSeparator />
                    <span
                      className={cn(
                        "shrink-0",
                        BORROW_DUE_TONE_CLASS[dueUrgency],
                      )}
                    >
                      {duePhrase}
                    </span>
                  </>
                ) : null}
              </p>
            ) : null}
            {hasRequests ? (
              <p
                className={cn(
                  LIST_ROW_META_TEXT_CLASS,
                  "font-semibold text-ink",
                )}
              >
                {TOOLS_COPY.listingRequestsNotice(tool.pendingRequestCount)}
              </p>
            ) : null}
          </div>
        ) : undefined
      }
      actionsPlacement="bodyEnd"
      actions={
        hasRequests || reservationCount > 0 || showMarkReturned ? (
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
            {reservationCount > 0 ? (
              <Link
                href={ROUTES.loans}
                className={buttonClassName({
                  variant: hasRequests ? "secondary" : "primary",
                  size: "sm",
                })}
                aria-label={TOOLS_COPY.listingReservationsLinkAria(
                  reservationCount,
                  tool.name,
                )}
              >
                {TOOLS_COPY.listingReservationsCta(reservationCount)}
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
