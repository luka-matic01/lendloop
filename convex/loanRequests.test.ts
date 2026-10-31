/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { AuthErrorCode } from "./lib/errors";
import {
  ADMIN_EMAIL,
  createConvexTest,
  errorCode,
  provisionUser,
  useAdminBootstrapEnv,
} from "../convex-test/helpers";

describe("loanRequests", () => {
  useAdminBootstrapEnv();

  it("rejects unauthenticated callers on queries and mutations", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Miter saw",
      category: "power_tools",
      condition: "good",
      description: "10-inch blade",
    });

    await expect(
      t.query(api.loanRequests.listMyRequests, {}),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.UNAUTHENTICATED,
    );

    await expect(
      t.query(api.loanRequests.listIncomingRequests, {}),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.UNAUTHENTICATED,
    );

    await expect(
      t.mutation(api.loanRequests.create, {
        toolId,
        startDate: "2026-11-01",
        endDate: "2026-11-03",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.UNAUTHENTICATED,
    );
  });

  it("validates borrow date ranges, self-borrowing, availability, and duplicates", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Rototiller",
      category: "garden",
      condition: "good",
      description: "",
    });

    // Self-borrowing forbidden
    await expect(
      lender.mutation(api.loanRequests.create, {
        toolId,
        startDate: "2026-11-01",
        endDate: "2026-11-03",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    // End date before start date
    await expect(
      borrower.mutation(api.loanRequests.create, {
        toolId,
        startDate: "2026-11-05",
        endDate: "2026-11-02",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    // Invalid date format
    await expect(
      borrower.mutation(api.loanRequests.create, {
        toolId,
        startDate: "11/01/2026",
        endDate: "2026-11-03",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    // Valid request succeeds
    await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
    });

    // Duplicate active request from same borrower is rejected
    await expect(
      borrower.mutation(api.loanRequests.create, {
        toolId,
        startDate: "2026-11-04",
        endDate: "2026-11-06",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );
  });

  it("enforces lender-only approve/decline and updates tool availability + competing requests", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrowerA } = await provisionUser(
      t,
      "borrower-a@test.com",
    );
    const { session: borrowerB } = await provisionUser(
      t,
      "borrower-b@test.com",
    );
    const { session: stranger } = await provisionUser(t, "stranger@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Stand mixer",
      category: "kitchen",
      condition: "excellent",
      description: "Includes dough hook",
    });

    const requestA = await borrowerA.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
    });

    const requestB = await borrowerB.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-02",
      endDate: "2026-11-04",
    });

    // Borrower and stranger cannot approve or decline
    await expect(
      borrowerA.mutation(api.loanRequests.approve, { requestId: requestA }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN,
    );

    await expect(
      stranger.mutation(api.loanRequests.decline, { requestId: requestA }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN,
    );

    // Lender approves requestA -> tool becomes unavailable and requestB is auto-declined
    await lender.mutation(api.loanRequests.approve, { requestId: requestA });

    const incoming = await lender.query(
      api.loanRequests.listIncomingRequests,
      {},
    );
    const byId = new Map(incoming.map((r) => [r._id, r]));
    expect(byId.get(requestA)?.status).toBe("approved");
    expect(byId.get(requestB)?.status).toBe("declined");

    const lenderTools = await lender.query(api.tools.listMine, {});
    expect(lenderTools[0]?.isAvailable).toBe(false);
    expect(lenderTools[0]?.hasActiveLoan).toBe(true);

    // Cannot manually re-enable availability while an approved loan is active
    await expect(
      lender.mutation(api.tools.setAvailability, {
        toolId,
        isAvailable: true,
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await expect(
      lender.mutation(api.tools.update, {
        toolId,
        name: "Renamed",
        category: "garden",
        condition: "good",
        description: "",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await expect(
      lender.mutation(api.tools.remove, { toolId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );
  });

  it("allows lender or borrower to mark an approved loan returned, and forbids strangers", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");
    const { session: stranger } = await provisionUser(t, "stranger@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Camping stove",
      category: "camping",
      condition: "good",
      description: "2-burner",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
    });

    // Cannot mark pending loan returned
    await expect(
      lender.mutation(api.loanRequests.markReturned, { requestId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await lender.mutation(api.loanRequests.approve, { requestId });

    // Stranger cannot mark returned
    await expect(
      stranger.mutation(api.loanRequests.markReturned, { requestId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN,
    );

    // Borrower can mark returned and tool goes back on board
    await borrower.mutation(api.loanRequests.markReturned, { requestId });

    const myRequests = await borrower.query(
      api.loanRequests.listMyRequests,
      {},
    );
    expect(myRequests[0]?.status).toBe("returned");

    const lenderTools = await lender.query(api.tools.listMine, {});
    expect(lenderTools[0]?.isAvailable).toBe(true);
  });

  it("restricts listAllForAdmin to admin and hydrates latestAutomation", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");
    const { session: admin } = await provisionUser(t, ADMIN_EMAIL);

    const toolId = await lender.mutation(api.tools.create, {
      name: "Tile cutter",
      category: "power_tools",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-02",
    });

    await t.run(async (ctx) => {
      await ctx.db.insert("automationLogs", {
        loanRequestId: requestId,
        kind: "overdue_reminder",
        idempotencyKey: `overdue:${requestId}:2026-11-03`,
        status: "sent",
        detail: "Reminder sent via n8n",
      });
    });

    await expect(
      borrower.query(api.loanRequests.listAllForAdmin, {}),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN,
    );

    const allLoans = await admin.query(api.loanRequests.listAllForAdmin, {});
    expect(allLoans).toHaveLength(1);
    expect(allLoans[0]).toMatchObject({
      _id: requestId,
      toolName: "Tile cutter",
      status: "pending",
      latestAutomation: {
        kind: "overdue_reminder",
        status: "sent",
        detail: "Reminder sent via n8n",
      },
    });
  });
});
