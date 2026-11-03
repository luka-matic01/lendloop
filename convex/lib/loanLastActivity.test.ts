import { describe, expect, it } from "vitest";

import {
  compareLoansByLastActivity,
  loanLastActivityAtMs,
} from "./loanLastActivity";

const base = {
  _creationTime: 1_000,
  requestNotifiedAt: undefined as number | undefined,
  statusDecidedAt: undefined as number | undefined,
  lastReminderSentAt: undefined as number | undefined,
  latestAutomationCreatedAt: undefined as number | undefined,
} as const;

describe("loanLastActivityAtMs", () => {
  it("uses request notification time for lender pending rows", () => {
    const at = loanLastActivityAtMs(
      {
        ...base,
        status: "pending",
        requestNotifiedAt: 5_000,
      },
      "lender",
    );
    expect(at).toBe(5_000);
  });

  it("uses creation time for borrower pending rows", () => {
    const at = loanLastActivityAtMs(
      {
        ...base,
        status: "pending",
        requestNotifiedAt: 5_000,
      },
      "borrower",
    );
    expect(at).toBe(1_000);
  });

  it("prefers the latest reminder over approval time", () => {
    const at = loanLastActivityAtMs(
      {
        ...base,
        status: "approved",
        statusDecidedAt: 2_000,
        lastReminderSentAt: 9_000,
      },
      "borrower",
    );
    expect(at).toBe(9_000);
  });

  it("includes admin automation timestamps", () => {
    const at = loanLastActivityAtMs(
      {
        ...base,
        status: "approved",
        statusDecidedAt: 2_000,
        latestAutomationCreatedAt: 8_000,
      },
      "admin",
    );
    expect(at).toBe(8_000);
  });
});

describe("compareLoansByLastActivity", () => {
  it("orders newer activity first regardless of status", () => {
    const pending = {
      ...base,
      _creationTime: 100,
      status: "pending" as const,
      requestNotifiedAt: 500,
    };
    const approved = {
      ...base,
      _creationTime: 50,
      status: "approved" as const,
      statusDecidedAt: 2_000,
    };

    expect(
      compareLoansByLastActivity(pending, approved, "lender"),
    ).toBeGreaterThan(0);
    expect(
      compareLoansByLastActivity(approved, pending, "lender"),
    ).toBeLessThan(0);
  });
});
