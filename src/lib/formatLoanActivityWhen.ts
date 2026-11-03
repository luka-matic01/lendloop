import { formatRelativeTimeAgo } from "@/lib/formatRelativeTimeAgo";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function startOfLocalDayMs(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function formatLocalDayMonth(ms: number): string {
  const d = new Date(ms);
  const month = MONTH_SHORT[d.getMonth()];
  if (!month) {
    return d.toLocaleDateString();
  }
  return `${d.getDate()} ${month}`;
}

/**
 * When a reminder was delivered: calendar-anchored, not “just now”.
 * Avoids implying the loan itself just became overdue.
 */
export function formatReminderSentWhen(
  timestampMs: number,
  nowMs = Date.now(),
): string {
  const sentDay = startOfLocalDayMs(timestampMs);
  const today = startOfLocalDayMs(nowMs);
  const dayDiff = Math.floor((today - sentDay) / MS_PER_DAY);

  if (dayDiff === 0) {
    return "today";
  }
  if (dayDiff === 1) {
    return "yesterday";
  }
  if (dayDiff < 7) {
    return new Date(timestampMs).toLocaleDateString("en-GB", {
      weekday: "short",
    });
  }

  const sentYear = new Date(timestampMs).getFullYear();
  const nowYear = new Date(nowMs).getFullYear();
  if (sentYear === nowYear) {
    return formatLocalDayMonth(timestampMs);
  }

  return new Date(timestampMs).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type LoanActivityWhenLine =
  | "reminder_sent"
  | "reminder_failed"
  | "request_received"
  | "request_submitted"
  | "approved"
  | "declined"
  | "notification_failed"
  | "automation_failed";

/** Compact “when” string for a loan row activity footnote. */
export function formatLoanActivityWhen(
  line: LoanActivityWhenLine,
  timestampMs: number,
  nowMs = Date.now(),
): string {
  if (line === "reminder_sent" || line === "reminder_failed") {
    return formatReminderSentWhen(timestampMs, nowMs);
  }
  return formatRelativeTimeAgo(timestampMs, nowMs);
}

/** Visible top-right label: reminders get copy; everything else is just “when”. */
export function formatLoanActivityCornerVisible(
  line: LoanActivityWhenLine,
  when: string,
): string {
  if (line === "reminder_sent") {
    return `Reminder sent ${when}`;
  }
  if (line === "reminder_failed") {
    return `Reminder failed ${when}`;
  }
  return when;
}
