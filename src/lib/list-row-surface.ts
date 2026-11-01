import { getBorrowDueUrgency } from "@/lib/format-borrow-due";
import { cn } from "@/lib/utils";

/** Bleed list rows to panel edges (matches divide-y list padding). */
export const LIST_ROW_BLEED_CLASS = "-mx-3 px-3 sm:-mx-4 sm:px-4";

/**
 * Shared row washes for loan + listing lists (on `bg-board-soft` panels).
 * Only active lends and overdue returns get a fill — everything else is panel default.
 */
export type ListRowSurface =
  | "default"
  | "needs_action"
  | "awaiting"
  | "out_active"
  | "overdue"
  | "inactive";

const SURFACE_CLASS: Record<ListRowSurface, string> = {
  default: LIST_ROW_BLEED_CLASS,
  /** Pending / requests — badge + actions, no row tint. */
  needs_action: LIST_ROW_BLEED_CLASS,
  awaiting: LIST_ROW_BLEED_CLASS,
  /** Approved loan / gear out on loan. */
  out_active: cn(LIST_ROW_BLEED_CLASS, "bg-positive-soft/35"),
  /** Past due return date. */
  overdue: cn(
    LIST_ROW_BLEED_CLASS,
    "border-l-4 border-l-negative bg-negative-soft/40",
  ),
  /** Paused listing / closed loan history. */
  inactive: LIST_ROW_BLEED_CLASS,
};

export function listRowSurfaceClass(surface: ListRowSurface): string {
  return SURFACE_CLASS[surface];
}

type LoanListRowSurfaceInput = {
  status: "pending" | "approved" | "declined" | "returned";
  endDate: string;
  perspective: "incoming" | "mine" | "admin";
  isClosed: boolean;
};

export function loanListRowSurfaceClass(input: LoanListRowSurfaceInput): string {
  if (input.isClosed) {
    return listRowSurfaceClass("inactive");
  }
  if (input.status === "pending") {
    if (input.perspective === "incoming") {
      return listRowSurfaceClass("needs_action");
    }
    if (input.perspective === "mine") {
      return listRowSurfaceClass("awaiting");
    }
    return listRowSurfaceClass("awaiting");
  }
  if (input.status === "approved") {
    if (getBorrowDueUrgency(input.endDate) === "overdue") {
      return listRowSurfaceClass("overdue");
    }
    return listRowSurfaceClass("out_active");
  }
  return listRowSurfaceClass("default");
}

type ListingListRowSurfaceInput = {
  pendingRequestCount: number;
  isAvailable: boolean;
  hasActiveLoan: boolean;
  activeLoanEndDate?: string;
};

export function listingListRowSurfaceClass(
  input: ListingListRowSurfaceInput,
): string {
  if (input.pendingRequestCount > 0) {
    return listRowSurfaceClass("needs_action");
  }
  if (input.hasActiveLoan) {
    if (
      input.activeLoanEndDate !== undefined &&
      getBorrowDueUrgency(input.activeLoanEndDate) === "overdue"
    ) {
      return listRowSurfaceClass("overdue");
    }
    return listRowSurfaceClass("out_active");
  }
  if (!input.isAvailable) {
    return listRowSurfaceClass("inactive");
  }
  return listRowSurfaceClass("default");
}
