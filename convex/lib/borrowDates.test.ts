/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import { AuthErrorCode } from "./errors";
import {
  isAutomationTodayParam,
  isUtcCalendarDate,
  parseBorrowDateRange,
} from "./borrowDates";
import { MAX_BORROW_CALENDAR_DAYS } from "./limits";
import { errorCode } from "../../convex-test/helpers";

describe("borrowDates", () => {
  const nowMs = Date.parse("2026-11-01T12:00:00.000Z");

  it("rejects impossible calendar dates", () => {
    expect(isUtcCalendarDate("2027-02-30")).toBe(false);
    expect(() =>
      parseBorrowDateRange("2027-02-30", "2027-03-01", nowMs),
    ).toThrow();
    try {
      parseBorrowDateRange("2027-02-30", "2027-03-01", nowMs);
    } catch (err) {
      expect(errorCode(err)).toBe(AuthErrorCode.VALIDATION_ERROR);
    }
  });

  it("limits inclusive borrow length", () => {
    expect(() =>
      parseBorrowDateRange("2026-11-01", "2027-01-30", nowMs),
    ).toThrow();
    const end = new Date(Date.UTC(2026, 10, 1));
    end.setUTCDate(end.getUTCDate() + MAX_BORROW_CALENDAR_DAYS - 1);
    const endIso = end.toISOString().slice(0, 10);
    expect(parseBorrowDateRange("2026-11-01", endIso, nowMs)).toEqual({
      startDate: "2026-11-01",
      endDate: endIso,
    });
  });

  it("restricts automation today to near UTC now", () => {
    expect(isAutomationTodayParam("9999-12-31", nowMs)).toBe(false);
    expect(isAutomationTodayParam("2026-11-01", nowMs)).toBe(true);
  });
});
