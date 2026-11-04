import { Pause, Pencil, Radio, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

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
import { BORROW_DUE_TONE_CLASS } from "@/lib/formatBorrowDue";
import { cn } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";

import { TOOLS_COPY } from "../constants/copy";
import { TOOLS_ICON_CLASS } from "../constants/visual";
import type { MyTool } from "../types/tools";
import { getMyListingPresentation } from "../utils/getMyListingPresentation";
import { ToolListingStateBadge } from "./ToolListingStateBadge";

const LISTING_ICON_BUTTON_CLASS =
  "hover:bg-canvas disabled:pointer-events-none disabled:opacity-40";

type ToolListingRowProps = {
  tool: MyTool;
  onEdit: () => void;
  onToggleAvailability: () => void;
  onRemove: () => void;
  markReturnedPendingId?: Id<"loanRequests"> | null;
  onMarkReturned?: (requestId: Id<"loanRequests">, toolName: string) => void;
  className?: string;
};

export function ToolListingRow({
  tool,
  onEdit,
  onToggleAvailability,
  onRemove,
  markReturnedPendingId = null,
  onMarkReturned,
  className,
}: ToolListingRowProps) {
  const view = useMemo(() => getMyListingPresentation(tool), [tool]);

  return (
    <ListRow
      className={className}
      title={tool.name}
      headerActions={
        <ListingRowIconActions
          view={view}
          onEdit={onEdit}
          onToggleAvailability={onToggleAvailability}
          onRemove={onRemove}
        />
      }
      meta={
        <>
          <ToolListingStateBadge state={view.listingState} />
          <ListRowMetaSeparator />
          <span>
            {view.categoryLabel} · {view.conditionLabel}
          </span>
        </>
      }
      details={
        view.showDetailsBlock ? (
          <div className="space-y-1">
            {view.activeLoanLine ? (
              <p className={LIST_ROW_META_TEXT_CLASS}>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {LOANS_COPY.borrowedBy(view.activeLoanLine.borrowerName)}
                </span>
                {view.activeLoanLine.duePhrase &&
                view.activeLoanLine.dueUrgency ? (
                  <>
                    <ListRowMetaSeparator />
                    <span
                      className={cn(
                        "shrink-0",
                        BORROW_DUE_TONE_CLASS[view.activeLoanLine.dueUrgency],
                      )}
                    >
                      {view.activeLoanLine.duePhrase}
                    </span>
                  </>
                ) : null}
              </p>
            ) : null}
            {view.pendingRequestCount > 0 ? (
              <p
                className={cn(
                  LIST_ROW_META_TEXT_CLASS,
                  "font-semibold text-ink",
                )}
              >
                {TOOLS_COPY.listingRequestsNotice(view.pendingRequestCount)}
              </p>
            ) : null}
          </div>
        ) : undefined
      }
      actionsPlacement="bodyEnd"
      actions={
        view.showBodyActions ? (
          <ListingRowBodyActions
            toolName={tool.name}
            view={view}
            markReturnedPendingId={markReturnedPendingId}
            onMarkReturned={onMarkReturned}
          />
        ) : undefined
      }
    />
  );
}

type ListingRowIconActionsProps = {
  view: ReturnType<typeof getMyListingPresentation>;
  onEdit: () => void;
  onToggleAvailability: () => void;
  onRemove: () => void;
};

function ListingRowIconActions({
  view,
  onEdit,
  onToggleAvailability,
  onRemove,
}: ListingRowIconActionsProps) {
  return (
    <div
      role="group"
      aria-label={TOOLS_COPY.listingActionsLabel}
      className="flex shrink-0 items-center gap-1"
    >
      <IconButton
        type="button"
        variant="ghost"
        aria-label={TOOLS_COPY.editListing}
        tooltip={view.editTooltip}
        disabled={view.editDisabled}
        onClick={onEdit}
        className={LISTING_ICON_BUTTON_CLASS}
      >
        <Pencil className={TOOLS_ICON_CLASS} aria-hidden />
      </IconButton>
      <IconButton
        type="button"
        variant="ghost"
        aria-label={
          view.isLive ? TOOLS_COPY.pauseListing : TOOLS_COPY.putOnBoard
        }
        tooltip={view.toggleAvailabilityTooltip}
        disabled={view.toggleAvailabilityDisabled}
        onClick={onToggleAvailability}
        className={LISTING_ICON_BUTTON_CLASS}
      >
        {view.isLive ? (
          <Pause className={TOOLS_ICON_CLASS} aria-hidden />
        ) : (
          <Radio className={TOOLS_ICON_CLASS} aria-hidden />
        )}
      </IconButton>
      <IconButton
        type="button"
        variant="ghost"
        aria-label={TOOLS_COPY.removeListing}
        tooltip={view.removeTooltip}
        disabled={view.removeDisabled}
        onClick={onRemove}
        className={cn(
          LISTING_ICON_BUTTON_CLASS,
          "text-ink-muted hover:text-negative",
        )}
      >
        <Trash2 className={TOOLS_ICON_CLASS} aria-hidden />
      </IconButton>
    </div>
  );
}

type ListingRowBodyActionsProps = {
  toolName: string;
  view: ReturnType<typeof getMyListingPresentation>;
  markReturnedPendingId: Id<"loanRequests"> | null;
  onMarkReturned?: (requestId: Id<"loanRequests">, toolName: string) => void;
};

function ListingRowBodyActions({
  toolName,
  view,
  markReturnedPendingId,
  onMarkReturned,
}: ListingRowBodyActionsProps) {
  const hasRequests = view.pendingRequestCount > 0;
  const { reservationCount } = view;

  return (
    <>
      {hasRequests ? (
        <Link
          href={ROUTES.loans}
          className={buttonClassName({ variant: "primary", size: "sm" })}
          aria-label={TOOLS_COPY.listingRequestsLinkAria(
            view.pendingRequestCount,
            toolName,
          )}
        >
          {TOOLS_COPY.listingRequestsCta(view.pendingRequestCount)}
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
            toolName,
          )}
        >
          {TOOLS_COPY.listingReservationsCta(reservationCount)}
        </Link>
      ) : null}
      {view.showMarkReturned &&
      view.markReturnedRequestId &&
      onMarkReturned ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={markReturnedPendingId === view.markReturnedRequestId}
          onClick={() =>
            onMarkReturned(view.markReturnedRequestId!, toolName)
          }
        >
          {LOANS_COPY.markReturned}
        </Button>
      ) : null}
    </>
  );
}
