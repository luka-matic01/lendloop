const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

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

/** ISO calendar date (YYYY-MM-DD) → DD.MM.YYYY for display. */
export function formatBorrowCalendarDate(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate.trim());
  if (!match) {
    return isoDate;
  }
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}

/** Compact board/modal dates (e.g. 7 Nov). */
export function formatBorrowDayMonth(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate.trim());
  if (!match) {
    return isoDate;
  }
  const [, , month, day] = match;
  const monthIndex = Number(month) - 1;
  const monthLabel = MONTH_SHORT[monthIndex];
  if (!monthLabel) {
    return formatBorrowCalendarDate(isoDate);
  }
  return `${Number(day)} ${monthLabel}`;
}

export function formatBookedRangeLabel(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatBorrowDayMonth(startDate);
  }
  return `${formatBorrowDayMonth(startDate)}–${formatBorrowDayMonth(endDate)}`;
}

type BookedRange = { startDate: string; endDate: string };

/** One line for borrow modal when some dates are already taken. */
export function formatBorrowBookedNotice(
  ranges: BookedRange[],
  loanOutUntil?: string,
): string {
  if (ranges.length === 0) {
    return "";
  }
  if (
    loanOutUntil !== undefined &&
    ranges.length === 1 &&
    ranges[0].startDate <= loanOutUntil &&
    loanOutUntil <= ranges[0].endDate
  ) {
    return `Out until ${formatBorrowDayMonth(loanOutUntil)}. Pick other dates.`;
  }
  const windows = ranges.map((r) =>
    formatBookedRangeLabel(r.startDate, r.endDate),
  );
  return `Booked ${windows.join(", ")}. Pick other dates.`;
}

function utcCalendarDayMs(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

function utcTodayMs(nowMs: number): number {
  const d = new Date(nowMs);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** UTC calendar date for `<input type="date">` min values and server parity. */
export function utcTodayIso(nowMs = Date.now()): string {
  const d = new Date(utcTodayMs(nowMs));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** True when the borrow period has started (start date is today or earlier, UTC). */
export function isBorrowPeriodStarted(
  startDate: string,
  nowMs = Date.now(),
): boolean {
  return startDate.trim() <= utcTodayIso(nowMs);
}

/** True when today falls inside an inclusive borrow range (UTC calendar days). */
export function isBorrowPeriodInProgress(
  startDate: string,
  endDate: string,
  nowMs = Date.now(),
): boolean {
  const today = utcTodayIso(nowMs);
  return startDate <= today && today <= endDate;
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
