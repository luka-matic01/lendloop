import type { LoanView } from "../types/loans";

const STATUS_ORDER: Record<LoanView["status"], number> = {
  pending: 0,
  approved: 1,
  returned: 2,
  cancelled: 3,
  declined: 4,
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

/** Past / closed loans: newest request first (recent declines and returns on top). */
export function sortClosedLoansByDate(loans: LoanView[]): LoanView[] {
  return [...loans].sort((a, b) => b._creationTime - a._creationTime);
}

export function isClosedLoanStatus(status: LoanView["status"]): boolean {
  return (
    status === "returned" ||
    status === "declined" ||
    status === "cancelled"
  );
}

export function partitionLoansForSection(loans: LoanView[]) {
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
    open: sortLoansForList(open),
    history: sortClosedLoansByDate(history),
  };
}
