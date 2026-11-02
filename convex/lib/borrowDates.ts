import { AuthErrorCode, authError } from "./errors";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

  if (!ISO_DATE_PATTERN.test(start) || !ISO_DATE_PATTERN.test(end)) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      "Dates must be in YYYY-MM-DD format",
    );
  }

  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    authError(AuthErrorCode.VALIDATION_ERROR, "Invalid borrow dates");
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

  return { startDate: start, endDate: end };
}
