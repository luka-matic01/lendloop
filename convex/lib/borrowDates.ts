import { AuthErrorCode, authError } from "./errors";
import { MAX_BORROW_CALENDAR_DAYS } from "./limits";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function utcDayOffset(fromIso: string, toIso: string): number {
  const fromMs = Date.parse(`${fromIso}T00:00:00Z`);
  const toMs = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((fromMs - toMs) / 86_400_000);
}

/** True when `iso` is a real UTC calendar date (YYYY-MM-DD). */
export function isUtcCalendarDate(iso: string): boolean {
  const trimmed = iso.trim();
  if (!ISO_DATE_PATTERN.test(trimmed)) {
    return false;
  }
  const [y, m, d] = trimmed.split("-").map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return (
    parsed.getUTCFullYear() === y &&
    parsed.getUTCMonth() === m - 1 &&
    parsed.getUTCDate() === d
  );
}

/** True for real UTC calendar dates within ±1 day of today (for automation `today`). */
export function isAutomationTodayParam(
  today: string,
  nowMs = Date.now(),
): boolean {
  const trimmed = today.trim();
  if (!isUtcCalendarDate(trimmed)) {
    return false;
  }
  const ref = utcTodayIso(nowMs);
  return Math.abs(utcDayOffset(trimmed, ref)) <= 1;
}

/** UTC calendar date for "today" (YYYY-MM-DD). Safe to compare lexicographically. */
export function utcTodayIso(nowMs = Date.now()): string {
  const d = new Date(nowMs);
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

/** Approved borrow whose start date is still in the future (upcoming reservation). */
export function isUpcomingBorrowReservation(
  startDate: string,
  nowMs = Date.now(),
): boolean {
  return !isBorrowPeriodStarted(startDate, nowMs);
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

/** Inclusive overlap between two calendar ranges (YYYY-MM-DD strings). */
export function borrowRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

/** Validates inclusive calendar borrow range (UTC date strings). */
export function parseBorrowDateRange(
  startDate: string,
  endDate: string,
  nowMs = Date.now(),
) {
  const start = startDate.trim();
  const end = endDate.trim();

  if (!isUtcCalendarDate(start) || !isUtcCalendarDate(end)) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      "Dates must be valid calendar days in YYYY-MM-DD format",
    );
  }

  const today = utcTodayIso(nowMs);
  if (start < today) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      "Start date cannot be in the past",
    );
  }

  if (end < start) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      "Return date must be on or after start date",
    );
  }

  const inclusiveDays = utcDayOffset(end, start) + 1;
  if (inclusiveDays > MAX_BORROW_CALENDAR_DAYS) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      `Borrow period cannot exceed ${MAX_BORROW_CALENDAR_DAYS} days`,
    );
  }

  return { startDate: start, endDate: end };
}
