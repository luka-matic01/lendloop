/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { AuthErrorCode } from "./lib/errors";
import { firstMyListingsPage } from "../convex-test/pagination";
import {
  ADMIN_EMAIL,
  createConvexTest,
  errorCode,
  provisionUser,
  useAdminBootstrapEnv,
  useBorrowTestClock,
} from "../convex-test/helpers";

describe("loanRequests", () => {
  useAdminBootstrapEnv();
  useBorrowTestClock();

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

    // Start date in the past
    await expect(
      borrower.mutation(api.loanRequests.create, {
        toolId,
        startDate: "2026-10-01",
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
    const { session: admin } = await provisionUser(t, ADMIN_EMAIL);

    const toolId = await lender.mutation(api.tools.create, {
      name: "Stand mixer",
      category: "kitchen",
      condition: "excellent",
      description: "Includes dough hook",
    });

    const requestA = await borrowerA.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-10-15",
      endDate: "2026-10-17",
    });

    const requestB = await borrowerB.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-10-16",
      endDate: "2026-10-18",
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

    // Lender approves requestA -> overlapping requestB is auto-declined
    await lender.mutation(api.loanRequests.approve, { requestId: requestA });

    const incoming = await lender.query(
      api.loanRequests.listIncomingRequests,
      {},
    );
    const byId = new Map(incoming.map((r) => [r._id, r]));
    expect(byId.get(requestA)?.status).toBe("approved");
    expect(byId.get(requestB)?.status).toBe("declined");

    const allLoans = await admin.query(api.loanRequests.listAllForAdmin, {});
    expect(allLoans.find((r) => r._id === requestB)?.status).toBe("declined");

    const lenderTools = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(lenderTools.page[0]?.isAvailable).toBe(true);
    expect(lenderTools.page[0]?.hasActiveLoan).toBe(true);
    expect(lenderTools.page[0]?.activeLoan?.started).toBe(true);

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

  it("keeps listings on the board and blocks only overlapping borrow dates", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");
    const { session: neighbor } = await provisionUser(t, "neighbor@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Ladder",
      category: "other",
      condition: "good",
      description: "6 ft",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-20",
      endDate: "2026-11-22",
    });

    await lender.mutation(api.loanRequests.approve, { requestId });

    const lenderTools = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(lenderTools.page[0]?.isAvailable).toBe(true);
    expect(lenderTools.page[0]?.activeLoan?.started).toBe(false);

    const board = await neighbor.query(api.tools.listBoard, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(board.page.some((row) => row._id === toolId)).toBe(true);

    await expect(
      neighbor.mutation(api.loanRequests.create, {
        toolId,
        startDate: "2026-11-21",
        endDate: "2026-11-23",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await neighbor.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-25",
      endDate: "2026-11-27",
    });

    await expect(
      lender.mutation(api.tools.update, {
        toolId,
        name: "Tall ladder",
        category: "other",
        condition: "good",
        description: "6 ft aluminum",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await expect(
      lender.mutation(api.tools.remove, { toolId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await lender.mutation(api.tools.setAvailability, {
      toolId,
      isAvailable: false,
    });

    const afterPause = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(afterPause.page[0]?.isAvailable).toBe(false);
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
      startDate: "2026-10-15",
      endDate: "2026-10-17",
    });

    // Cannot mark pending loan returned
    await expect(
      lender.mutation(api.loanRequests.markReturned, { requestId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await lender.mutation(api.loanRequests.approve, { requestId });

    const lenderListings = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(lenderListings.page[0]?.hasActiveLoan).toBe(true);
    expect(lenderListings.page[0]?.activeLoan).toMatchObject({
      requestId,
      startDate: "2026-10-15",
      endDate: "2026-10-17",
      started: true,
    });
    expect(lenderListings.page[0]?.activeLoan?.borrowerName).toBeTruthy();

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
    expect(myRequests).toHaveLength(1);
    expect(myRequests[0]?.status).toBe("returned");

    const { session: admin } = await provisionUser(t, ADMIN_EMAIL);
    const allLoans = await admin.query(api.loanRequests.listAllForAdmin, {});
    expect(allLoans.find((r) => r._id === requestId)?.status).toBe("returned");

    const lenderTools = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(lenderTools.page[0]?.isAvailable).toBe(true);
  });

  it("lets the borrower cancel a pending request and forbids others", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");
    const { session: stranger } = await provisionUser(t, "stranger@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Leaf blower",
      category: "garden",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
    });

    await expect(
      lender.mutation(api.loanRequests.cancelPending, { requestId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN,
    );

    await expect(
      stranger.mutation(api.loanRequests.cancelPending, { requestId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN,
    );

    await borrower.mutation(api.loanRequests.cancelPending, { requestId });

    const mine = await borrower.query(api.loanRequests.listMyRequests, {});
    expect(mine[0]?.status).toBe("cancelled");

    const incoming = await lender.query(
      api.loanRequests.listIncomingRequests,
      {},
    );
    expect(incoming.find((row) => row._id === requestId)?.status).toBe(
      "cancelled",
    );

    const lenderTools = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(lenderTools.page[0]?.pendingRequestCount).toBe(0);

    await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-04",
      endDate: "2026-11-06",
    });
  });

  it("lets lender or borrower cancel an approved reservation before the borrow starts", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");
    const { session: stranger } = await provisionUser(t, "stranger@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Pressure washer",
      category: "garden",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-20",
      endDate: "2026-11-22",
    });

    await lender.mutation(api.loanRequests.approve, { requestId });

    await expect(
      lender.mutation(api.loanRequests.markReturned, { requestId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await expect(
      stranger.mutation(api.loanRequests.cancelApproved, { requestId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN,
    );

    await borrower.mutation(api.loanRequests.cancelApproved, { requestId });

    const mine = await borrower.query(api.loanRequests.listMyRequests, {});
    expect(mine[0]?.status).toBe("cancelled");

    const lenderTools = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(lenderTools.page[0]?.hasActiveLoan).toBe(false);
    expect(lenderTools.page[0]?.upcomingReservationCount).toBe(0);
  });

  it("lists additional upcoming reservations on the same listing", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrowerA } = await provisionUser(t, "a@test.com");
    const { session: borrowerB } = await provisionUser(t, "b@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Shop vac",
      category: "other",
      condition: "good",
      description: "",
    });

    const firstId = await borrowerA.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-20",
      endDate: "2026-11-21",
    });
    const secondId = await borrowerB.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-25",
      endDate: "2026-11-26",
    });

    await lender.mutation(api.loanRequests.approve, { requestId: firstId });
    await lender.mutation(api.loanRequests.approve, { requestId: secondId });

    const listings = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    const row = listings.page[0];
    expect(row?.activeLoan?.requestId).toBe(firstId);
    expect(row?.upcomingReservationCount).toBe(2);
  });

  it("counts only upcoming approved borrows as reservations, not the loan in progress", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrowerA } = await provisionUser(t, "a@test.com");
    const { session: borrowerB } = await provisionUser(t, "b@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Socket set",
      category: "other",
      condition: "good",
      description: "",
    });

    const outNow = await borrowerA.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-10-15",
      endDate: "2026-11-05",
    });
    const later = await borrowerB.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-20",
      endDate: "2026-11-22",
    });

    await lender.mutation(api.loanRequests.approve, { requestId: outNow });
    await lender.mutation(api.loanRequests.approve, { requestId: later });

    const listings = await lender.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    const row = listings.page[0];
    expect(row?.activeLoan?.started).toBe(true);
    expect(row?.upcomingReservationCount).toBe(1);
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

  it("hydrates member timeline fields and sets statusDecidedAt on approve", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");

    const toolId = await lender.mutation(api.tools.create, {
      name: "Level",
      category: "other",
      condition: "good",
      description: "",
    });

    const requestId = await borrower.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-02",
    });

    const pendingIncoming = await lender.query(
      api.loanRequests.listIncomingRequests,
      {},
    );
    expect(pendingIncoming[0]).toMatchObject({
      _id: requestId,
      status: "pending",
    });
    expect(pendingIncoming[0]?._creationTime).toBeTypeOf("number");

    await lender.mutation(api.loanRequests.approve, { requestId });

    const mine = await borrower.query(api.loanRequests.listMyRequests, {});
    expect(mine[0]?.status).toBe("approved");
    expect(mine[0]?.statusDecidedAt).toBeTypeOf("number");
    expect(mine[0]?.latestAutomation).toBeUndefined();
  });

  it("omits failed automation logs from member loan queries (admin-only in API)", async () => {
    const t = createConvexTest();
    const { session: lender } = await provisionUser(t, "lender@test.com");
    const { session: borrower } = await provisionUser(t, "borrower@test.com");
    const { session: admin } = await provisionUser(t, ADMIN_EMAIL);

    const toolId = await lender.mutation(api.tools.create, {
      name: "Router",
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
        kind: "request_notification",
        idempotencyKey: `notify:${requestId}:fail`,
        status: "failed",
        detail: "SMTP connection refused",
      });
    });

    const mine = await borrower.query(api.loanRequests.listMyRequests, {});
    expect(mine[0]?.latestAutomation).toBeUndefined();

    const incoming = await lender.query(
      api.loanRequests.listIncomingRequests,
      {},
    );
    expect(incoming[0]?.latestAutomation).toBeUndefined();

    const allLoans = await admin.query(api.loanRequests.listAllForAdmin, {});
    expect(allLoans[0]?.latestAutomation).toMatchObject({
      kind: "request_notification",
      status: "failed",
      detail: "SMTP connection refused",
    });
  });
});
