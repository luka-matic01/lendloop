import type { LoanView } from "../types/loans";
import type { LoanPerspective } from "./formatLoan";

export type LoanActivityFootnoteLine =
  | "reminder_sent"
  | "request_received"
  | "request_submitted"
  | "approved"
  | "declined"
  | "notification_failed"
  | "reminder_failed"
  | "automation_failed";

export type LoanActivityFootnote = {
  line: LoanActivityFootnoteLine;
  atMs: number;
  tone: "muted" | "negative";
  detail?: string;
};

/** Loan row corner: last status change / request time, plus optional overdue reminder. */
export function getLoanActivityFootnotes(
  loan: LoanView,
  perspective: LoanPerspective,
): LoanActivityFootnote[] {
  const lines: LoanActivityFootnote[] = [];

  if (loan.status === "pending") {
    if (perspective === "mine") {
      lines.push({
        line: "request_submitted",
        atMs: loan._creationTime,
        tone: "muted",
      });
    } else {
      lines.push({
        line: "request_received",
        atMs: loan.requestNotifiedAt ?? loan._creationTime,
        tone: "muted",
      });
    }
  } else if (loan.status === "approved" && loan.statusDecidedAt !== undefined) {
    lines.push({
      line: "approved",
      atMs: loan.statusDecidedAt,
      tone: "muted",
    });
  } else if (loan.status === "declined" && loan.statusDecidedAt !== undefined) {
    lines.push({
      line: "declined",
      atMs: loan.statusDecidedAt,
      tone: "muted",
    });
  }

  if (loan.lastReminderSentAt !== undefined) {
    lines.push({
      line: "reminder_sent",
      atMs: loan.lastReminderSentAt,
      tone: "muted",
    });
  }

  return lines;
}
