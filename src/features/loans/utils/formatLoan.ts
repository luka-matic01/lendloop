import { isBorrowPeriodStarted } from "@/lib/formatBorrowDue";
import { loanListRowSurfaceClass } from "@/lib/listRowSurface";

import { LOANS_COPY } from "../constants/copy";
import type { LoanView } from "../types/loans";
import { isClosedLoanStatus } from "./sortLoans";

export type LoanPerspective = "incoming" | "mine" | "admin";

export function formatLoanPartyLine(
  loan: LoanView,
  perspective: LoanPerspective,
): string {
  if (perspective === "incoming") {
    if (loan.status === "returned") {
      return LOANS_COPY.borrowedBy(loan.borrowerName);
    }
    if (
      loan.status === "approved" &&
      !isBorrowPeriodStarted(loan.startDate)
    ) {
      return LOANS_COPY.reservedFor(loan.borrowerName);
    }
    if (loan.status === "approved") {
      return LOANS_COPY.borrowedBy(loan.borrowerName);
    }
    return LOANS_COPY.requestedBy(loan.borrowerName);
  }
  if (perspective === "mine") {
    if (loan.status === "pending" || loan.status === "declined") {
      return LOANS_COPY.requestSentTo(loan.lenderName);
    }
    if (
      loan.status === "approved" &&
      !isBorrowPeriodStarted(loan.startDate)
    ) {
      return LOANS_COPY.upcomingBorrowFrom(loan.lenderName);
    }
    return LOANS_COPY.borrowedFrom(loan.lenderName);
  }
  return `${loan.borrowerName} to ${loan.lenderName}`;
}

export function loanRowSurfaceClass(
  loan: LoanView,
  perspective: LoanPerspective,
): string {
  return loanListRowSurfaceClass({
    status: loan.status,
    startDate: loan.startDate,
    endDate: loan.endDate,
    perspective,
    isClosed: isClosedLoanStatus(loan.status),
  });
}

