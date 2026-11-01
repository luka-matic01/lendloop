const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** ISO calendar date (YYYY-MM-DD) → DD.MM.YYYY for display. */
export function formatBorrowCalendarDate(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate.trim());
  if (!match) {
    return isoDate;
  }
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}

function utcCalendarDayMs(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

function utcTodayMs(nowMs: number): number {
  const d = new Date(nowMs);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export type BorrowDueUrgency = "overdue" | "today" | "upcoming";

export const BORROW_DUE_TONE_CLASS: Record<BorrowDueUrgency, string> = {
  overdue: "text-negative font-bold",
  today: "text-warning font-bold",
  upcoming: "text-ink-muted",
};

function borrowDueDiffDays(endDate: string, nowMs = Date.now()): number {
  const endDay = utcCalendarDayMs(endDate);
  return Math.round((endDay - utcTodayMs(nowMs)) / MS_PER_DAY);
}

export function getBorrowDueUrgency(
  endDate: string,
  nowMs = Date.now(),
): BorrowDueUrgency {
  const diffDays = borrowDueDiffDays(endDate, nowMs);
  if (diffDays < 0) {
    return "overdue";
  }
  if (diffDays === 0) {
    return "today";
  }
  return "upcoming";
}

/** Short due line for compact UI (ISO calendar end date, UTC). */
export function formatBorrowDuePhrase(endDate: string, nowMs = Date.now()): string {
  const diffDays = borrowDueDiffDays(endDate, nowMs);

  if (diffDays > 1) {
    return `Due in ${diffDays} days`;
  }
  if (diffDays === 1) {
    return "Due tomorrow";
  }
  if (diffDays === 0) {
    return "Due today";
  }
  const overdue = -diffDays;
  if (overdue === 1) {
    return "1 day overdue";
  }
  return `${overdue} days overdue`;
}
