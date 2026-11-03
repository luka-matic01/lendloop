import type { Doc } from "../_generated/dataModel";

/** Who is viewing the list: affects which timestamp represents a pending request. */
export type LoanListSortPerspective = "borrower" | "lender" | "admin";

export type LoanActivityTimestamps = Pick<
  Doc<"loanRequests">,
  | "_creationTime"
  | "status"
  | "requestNotifiedAt"
  | "statusDecidedAt"
  | "lastReminderSentAt"
> & {
  latestAutomationCreatedAt?: number;
};

/** Newest meaningful event on this loan row (matches loan list footnote timestamps). */
export function loanLastActivityAtMs(
  loan: LoanActivityTimestamps,
  perspective: LoanListSortPerspective,
): number {
  let latest = loan._creationTime;

  if (loan.status === "pending") {
    if (perspective === "borrower") {
      latest = Math.max(latest, loan._creationTime);
    } else {
      latest = Math.max(latest, loan.requestNotifiedAt ?? loan._creationTime);
    }
  } else if (
    (loan.status === "approved" ||
      loan.status === "declined" ||
      loan.status === "returned" ||
      loan.status === "cancelled") &&
    loan.statusDecidedAt !== undefined
  ) {
    latest = Math.max(latest, loan.statusDecidedAt);
  }

  if (loan.lastReminderSentAt !== undefined) {
    latest = Math.max(latest, loan.lastReminderSentAt);
  }

  if (loan.latestAutomationCreatedAt !== undefined) {
    latest = Math.max(latest, loan.latestAutomationCreatedAt);
  }

  return latest;
}

export function compareLoansByLastActivity(
  a: LoanActivityTimestamps,
  b: LoanActivityTimestamps,
  perspective: LoanListSortPerspective,
): number {
  const byActivity =
    loanLastActivityAtMs(b, perspective) - loanLastActivityAtMs(a, perspective);
  if (byActivity !== 0) {
    return byActivity;
  }
  return b._creationTime - a._creationTime;
}

export function sortLoanRowsByLastActivity<T extends LoanActivityTimestamps>(
  rows: T[],
  perspective: LoanListSortPerspective,
): T[] {
  return [...rows].sort((a, b) =>
    compareLoansByLastActivity(a, b, perspective),
  );
}

type LoanViewActivityFields = Pick<
  Doc<"loanRequests">,
  | "_creationTime"
  | "status"
  | "requestNotifiedAt"
  | "statusDecidedAt"
  | "lastReminderSentAt"
> & {
  latestAutomation?: { createdAt: number };
};

export function compareLoanViewsByLastActivity(
  a: LoanViewActivityFields,
  b: LoanViewActivityFields,
  perspective: LoanListSortPerspective,
): number {
  return compareLoansByLastActivity(
    {
      _creationTime: a._creationTime,
      status: a.status,
      requestNotifiedAt: a.requestNotifiedAt,
      statusDecidedAt: a.statusDecidedAt,
      lastReminderSentAt: a.lastReminderSentAt,
      latestAutomationCreatedAt: a.latestAutomation?.createdAt,
    },
    {
      _creationTime: b._creationTime,
      status: b.status,
      requestNotifiedAt: b.requestNotifiedAt,
      statusDecidedAt: b.statusDecidedAt,
      lastReminderSentAt: b.lastReminderSentAt,
      latestAutomationCreatedAt: b.latestAutomation?.createdAt,
    },
    perspective,
  );
}

export function sortLoanViewsByLastActivity<T extends LoanViewActivityFields>(
  rows: T[],
  perspective: LoanListSortPerspective,
): T[] {
  return [...rows].sort((a, b) =>
    compareLoanViewsByLastActivity(a, b, perspective),
  );
}
