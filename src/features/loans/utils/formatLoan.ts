import type { LoanView } from "../types/loans";

export function formatIncomingPartyLine(loan: LoanView): string {
  return `Requested by ${loan.borrowerName}`;
}

export function formatMyRequestPartyLine(loan: LoanView): string {
  return `To ${loan.lenderName}${loan.lenderIsTrusted ? " · Trusted lender" : ""}`;
}

export function formatLoanDateRange(startDate: string, endDate: string) {
  return `${startDate} → ${endDate}`;
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
