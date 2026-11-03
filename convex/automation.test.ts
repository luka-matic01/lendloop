/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { internal } from "./_generated/api";
import { api } from "./_generated/api";
import { signPayload, verifySignature } from "./lib/hmac";
import {
  createConvexTest,
  provisionUser,
  useAdminBootstrapEnv,
  useBorrowTestClock,
} from "../convex-test/helpers";

const TEST_SECRET = "test_hmac_secret_for_automation";

describe("automation", () => {
  useAdminBootstrapEnv();
  useBorrowTestClock("2026-10-15T12:00:00.000Z");

  beforeEach(() => {
    vi.stubEnv("WEBHOOK_HMAC_SECRET", TEST_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("signs and verifies HMAC payloads", async () => {
    const body = '{"hello":"world"}';
    const signature = await signPayload(TEST_SECRET, body);
    expect(await verifySignature(TEST_SECRET, body, signature)).toBe(true);
    expect(await verifySignature(TEST_SECRET, body, "deadbeef")).toBe(false);
    expect(await verifySignature("wrong", body, signature)).toBe(false);
  });

  it("rejects unsigned automation HTTP calls", async () => {
    const t = createConvexTest();
    const response = await t.fetch("/automation/overdue-loans");
    expect(response.status).toBe(401);
  });

  it("returns overdue approved loans past end date", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Post hole digger",
      category: "garden",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
    });
    await lender.mutation(api.loanRequests.approve, { requestId });

    const today = "2026-11-05";
    const path = "/automation/overdue-loans";
    const signature = await signPayload(TEST_SECRET, path);
    const response = await t.fetch(`${path}?today=${today}`, {
      headers: { "X-LendLoop-Signature": signature },
    });
    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      loans: Array<{ loanRequestId: string }>;
    };
    expect(data.loans.map((row) => row.loanRequestId)).toContain(requestId);
  });

  it("records reminder write-backs idempotently", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Wheelbarrow",
      category: "garden",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
    });
    await lender.mutation(api.loanRequests.approve, { requestId });

    const idempotencyKey = `overdue:${requestId}:2026-11-05`;
    const body = JSON.stringify({
      idempotencyKey,
      loanRequestId: requestId,
      status: "sent",
      detail: "Reminder sent via n8n",
    });
    const signature = await signPayload(TEST_SECRET, body);

    const post = () =>
      t.fetch("/automation/reminder-sent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LendLoop-Signature": signature,
        },
        body,
      });

    expect((await post()).status).toBe(200);
    expect((await post()).status).toBe(200);

    const logs = await t.run(async (ctx) => {
      return await ctx.db
        .query("automationLogs")
        .withIndex("by_idempotency_key", (q) =>
          q.eq("idempotencyKey", idempotencyKey),
        )
        .collect();
    });
    expect(logs).toHaveLength(1);

    const loan = await t.run(async (ctx) => ctx.db.get(requestId));
    expect(loan?.lastReminderSentAt).toBeDefined();
  });

  it("records failed reminders and upgrades to sent on retry", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Chainsaw",
      category: "garden",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
    });
    await lender.mutation(api.loanRequests.approve, { requestId });

    const idempotencyKey = `overdue:${requestId}:2026-11-05`;

    const postBody = (status: "sent" | "failed", detail: string) => {
      const body = JSON.stringify({
        idempotencyKey,
        loanRequestId: requestId,
        status,
        detail,
      });
      return signPayload(TEST_SECRET, body).then((signature) =>
        t.fetch("/automation/reminder-sent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-LendLoop-Signature": signature,
          },
          body,
        }),
      );
    };

    expect((await postBody("failed", "SMTP timeout")).status).toBe(200);
    expect((await postBody("sent", "Delivered on retry")).status).toBe(200);

    const logs = await t.run(async (ctx) => {
      return await ctx.db
        .query("automationLogs")
        .withIndex("by_idempotency_key", (q) =>
          q.eq("idempotencyKey", idempotencyKey),
        )
        .collect();
    });
    expect(logs).toHaveLength(1);
    expect(logs[0]?.status).toBe("sent");

    const loan = await t.run(async (ctx) => ctx.db.get(requestId));
    expect(loan?.lastReminderSentAt).toBeDefined();
  });

  it("lists overdue loans via internal query for a fixed today", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Lawn aerator",
      category: "garden",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-02",
    });
    await lender.mutation(api.loanRequests.approve, { requestId });

    const pendingToolId = await lender.mutation(api.tools.create, {
      name: "Spare rake",
      category: "garden",
      condition: "good",
      description: "",
    });
    await borrower.mutation(api.loanRequests.create, {
      toolId: pendingToolId,
      startDate: "2026-11-10",
      endDate: "2026-11-12",
    });

    const result = await t.query(internal.automation.listOverdueLoans, {
      today: "2026-11-05",
    });
    expect(result.loans.map((row) => row.loanRequestId)).toEqual([requestId]);
  });

  it("sets requestNotifiedAt when the lender borrow alert succeeds", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Stud finder",
      category: "other",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-02",
    });

    await t.mutation(internal.automation.recordAutomation, {
      loanRequestId: requestId,
      kind: "request_notification",
      idempotencyKey: `request:${requestId}:created`,
      status: "sent",
    });

    const loan = await t.run(async (ctx) => ctx.db.get(requestId));
    expect(loan?.requestNotifiedAt).toBeTypeOf("number");
  });
});
