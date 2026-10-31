import { AuthErrorCode, authError } from "./errors";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Validates inclusive calendar borrow range (UTC date strings). */
export function parseBorrowDateRange(startDate: string, endDate: string) {
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

  if (end < start) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      "Return date must be on or after start date",
    );
  }

  return { startDate: start, endDate: end };
}
