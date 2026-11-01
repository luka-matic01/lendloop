import {
  formatBorrowCalendarDate,
} from "@/lib/format-borrow-due";
import { loanListRowSurfaceClass } from "@/lib/list-row-surface";

import { LOANS_COPY } from "../constants/copy";
import type { LoanView } from "../types/loans";
import { isClosedLoanStatus } from "./sortLoans";

export type LoanPerspective = "incoming" | "mine" | "admin";

export function formatLoanPartyLine(
  loan: LoanView,
  perspective: LoanPerspective,
): string {
  if (perspective === "incoming") {
    return loan.status === "approved" || loan.status === "returned"
      ? LOANS_COPY.borrowedBy(loan.borrowerName)
      : LOANS_COPY.requestedBy(loan.borrowerName);
  }
  if (perspective === "mine") {
    if (loan.status === "pending" || loan.status === "declined") {
      return LOANS_COPY.requestSentTo(loan.lenderName);
    }
    return LOANS_COPY.borrowedFrom(loan.lenderName);
  }
  return `${loan.borrowerName} → ${loan.lenderName}`;
}

export function formatLoanDateRange(startDate: string, endDate: string) {
  return `${formatBorrowCalendarDate(startDate)} → ${formatBorrowCalendarDate(endDate)}`;
}

export function loanRowSurfaceClass(
  loan: LoanView,
  perspective: LoanPerspective,
): string {
  return loanListRowSurfaceClass({
    status: loan.status,
    endDate: loan.endDate,
    perspective,
    isClosed: isClosedLoanStatus(loan.status),
  });
}

/** Shown under a row only when there is real automation activity. */
export function formatLoanAutomationDetail(loan: LoanView): string | null {
  if (loan.latestAutomation) {
    const { kind, status, createdAt } = loan.latestAutomation;
    const when = formatRelativeTime(createdAt);
    return `${kind.replace(/_/g, " ")} ${status} ${when}`;
  }
  if (loan.lastReminderSentAt !== undefined) {
    return `Reminder sent ${formatRelativeTime(loan.lastReminderSentAt)}`;
  }
  return null;
}

function formatRelativeTime(timestampMs: number): string {
  const diffMs = Date.now() - timestampMs;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return "today";
  }
  if (days === 1) {
    return "1 day ago";
  }
  return `${days} days ago`;
}
