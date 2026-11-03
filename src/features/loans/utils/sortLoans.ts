import {
  compareLoanViewsByLastActivity,
  type LoanListSortPerspective,
} from "convex/lib/loanLastActivity";

import type { LoanView } from "../types/loans";
import type { LoanPerspective } from "./formatLoan";

export function loanListSortPerspective(
  perspective: LoanPerspective,
): LoanListSortPerspective {
  if (perspective === "mine") {
    return "borrower";
  }
  if (perspective === "incoming") {
    return "lender";
  }
  return "admin";
}

/** Open loans: most recent activity first (matches row footnote timestamps). */
export function sortLoansForList(
  loans: LoanView[],
  perspective: LoanPerspective,
): LoanView[] {
  const sortPerspective = loanListSortPerspective(perspective);
  return [...loans].sort((a, b) =>
    compareLoanViewsByLastActivity(a, b, sortPerspective),
  );
}

/** Past / closed loans: newest activity first. */
export function sortClosedLoansByActivity(
  loans: LoanView[],
  perspective: LoanPerspective,
): LoanView[] {
  return sortLoansForList(loans, perspective);
}

export function isClosedLoanStatus(status: LoanView["status"]): boolean {
  return (
    status === "returned" ||
    status === "declined" ||
    status === "cancelled"
  );
}

export function partitionLoansForSection(
  loans: LoanView[],
  perspective: LoanPerspective,
) {
  const open: LoanView[] = [];
  const history: LoanView[] = [];
  for (const loan of loans) {
    if (isClosedLoanStatus(loan.status)) {
      history.push(loan);
    } else {
      open.push(loan);
    }
  }
  return {
    open: sortLoansForList(open, perspective),
    history: sortClosedLoansByActivity(history, perspective),
  };
}
