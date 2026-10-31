import type { LoanView } from "../types/loans";

const STATUS_ORDER: Record<LoanView["status"], number> = {
  pending: 0,
  approved: 1,
  returned: 2,
  declined: 3,
};

/** Active requests first; closed loans sink to the bottom of each section. */
export function sortLoansForList(loans: LoanView[]): LoanView[] {
  return [...loans].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) {
      return byStatus;
    }
    return b._creationTime - a._creationTime;
  });
}

export function isClosedLoanStatus(status: LoanView["status"]): boolean {
  return status === "returned" || status === "declined";
}

/** Actionable loans for Incoming / My requests (matches Convex list scoping). */
export function filterOpenLoansForSection(loans: LoanView[]): LoanView[] {
  return loans.filter((loan) => !isClosedLoanStatus(loan.status));
}
