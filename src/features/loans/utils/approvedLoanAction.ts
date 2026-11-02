import { isBorrowPeriodInProgress, isBorrowPeriodStarted } from "@/lib/formatBorrowDue";

export type ApprovedLoanRowAction = "cancel" | "markReturned";

export function approvedLoanRowAction(
  status: string,
  startDate: string,
): ApprovedLoanRowAction | null {
  if (status !== "approved") {
    return null;
  }
  if (!isBorrowPeriodStarted(startDate)) {
    return "cancel";
  }
  return "markReturned";
}

export function isApprovedLoanOutOnTool(startDate: string, endDate: string): boolean {
  return isBorrowPeriodInProgress(startDate, endDate);
}

export function isApprovedLoanReserved(startDate: string): boolean {
  return !isBorrowPeriodStarted(startDate);
}

type ApprovedLoanLike = {
  status: string;
  startDate: string;
  endDate: string;
};

export function countApprovedLoanPhases(loans: ApprovedLoanLike[]) {
  let out = 0;
  let reserved = 0;
  for (const loan of loans) {
    if (loan.status !== "approved") {
      continue;
    }
    if (isApprovedLoanReserved(loan.startDate)) {
      reserved += 1;
    } else {
      out += 1;
    }
  }
  return { out, reserved };
}
