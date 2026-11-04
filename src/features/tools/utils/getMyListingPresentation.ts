import type { Id } from "convex/_generated/dataModel";

import type { BorrowDueUrgency } from "@/lib/formatBorrowDue";
import {
  formatBorrowDuePhrase,
  getBorrowDueUrgency,
  isBorrowPeriodStarted,
} from "@/lib/formatBorrowDue";

import { TOOLS_COPY } from "../constants/copy";
import {
  TOOL_CATEGORY_LABELS,
  TOOL_CONDITION_LABELS,
} from "../constants/labels";
import type { ToolListingState } from "../types/listingState";
import type { MyTool } from "../types/tools";
import { getToolListingState } from "./getToolListingState";
import { listingManagementLock } from "./listingManagementLock";

export type MyListingPresentation = {
  listingState: ToolListingState;
  categoryLabel: string;
  conditionLabel: string;
  titleMuted: boolean;
  editDisabled: boolean;
  editTooltip: string | undefined;
  removeDisabled: boolean;
  removeTooltip: string | undefined;
  isLive: boolean;
  toggleAvailabilityDisabled: boolean;
  toggleAvailabilityTooltip: string | undefined;
  showDetailsBlock: boolean;
  activeLoanLine:
    | {
        borrowerName: string;
        duePhrase: string | null;
        dueUrgency: BorrowDueUrgency | null;
      }
    | undefined;
  pendingRequestCount: number;
  reservationCount: number;
  showBodyActions: boolean;
  showMarkReturned: boolean;
  markReturnedRequestId: Id<"loanRequests"> | undefined;
};

export function getMyListingPresentation(tool: MyTool): MyListingPresentation {
  const activeLoan = tool.activeLoan;
  const loanInProgress = activeLoan?.started === true;
  const isLive = tool.isAvailable;
  const isOnLoan = loanInProgress;
  const listingState = getToolListingState(tool);
  const isReserved = listingState === "reserved";
  const hasRequests = tool.pendingRequestCount > 0;
  const reservationCount = tool.upcomingReservationCount;
  const { locked: listingLockedForEdit, tooltip: listingLockedTooltip } =
    listingManagementLock(tool);
  const showMarkReturned =
    activeLoan !== undefined && isBorrowPeriodStarted(activeLoan.startDate);

  const duePhrase =
    loanInProgress && activeLoan
      ? formatBorrowDuePhrase(activeLoan.endDate)
      : null;
  const dueUrgency =
    loanInProgress && activeLoan
      ? getBorrowDueUrgency(activeLoan.endDate)
      : null;

  const titleMuted =
    !isLive &&
    !isOnLoan &&
    !isReserved &&
    !hasRequests &&
    reservationCount === 0;

  const showDetailsBlock =
    (showMarkReturned && activeLoan !== undefined) || hasRequests;

  const showBodyActions =
    hasRequests || reservationCount > 0 || showMarkReturned;

  return {
    listingState,
    categoryLabel: TOOL_CATEGORY_LABELS[tool.category],
    conditionLabel: TOOL_CONDITION_LABELS[tool.condition],
    titleMuted,
    editDisabled: listingLockedForEdit,
    editTooltip: listingLockedTooltip,
    removeDisabled: listingLockedForEdit,
    removeTooltip: listingLockedTooltip,
    isLive,
    toggleAvailabilityDisabled: !isLive && isOnLoan,
    toggleAvailabilityTooltip:
      !isLive && isOnLoan ? TOOLS_COPY.putOnBoardBlockedActiveLoan : undefined,
    showDetailsBlock,
    activeLoanLine:
      showMarkReturned && activeLoan
        ? {
            borrowerName: activeLoan.borrowerName,
            duePhrase,
            dueUrgency,
          }
        : undefined,
    pendingRequestCount: tool.pendingRequestCount,
    reservationCount,
    showBodyActions,
    showMarkReturned,
    markReturnedRequestId: activeLoan?.requestId,
  };
}
