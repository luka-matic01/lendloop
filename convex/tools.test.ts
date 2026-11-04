/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { AuthErrorCode } from "./lib/errors";
import {
  firstBoardPage,
  firstMyListingsPage,
} from "../convex-test/pagination";
import {
  ADMIN_EMAIL,
  createConvexTest,
  errorCode,
  provisionUser,
  useAdminBootstrapEnv,
  useBorrowTestClock,
} from "../convex-test/helpers";

describe("tools", () => {
  useAdminBootstrapEnv();
  useBorrowTestClock();

  it("listPublic returns only name and category for available tools", async () => {
    const t = createConvexTest();
    const { session, userId } = await provisionUser(t, "lender@test.com");

    await session.mutation(api.tools.create, {
      name: "Circular saw",
      category: "power_tools",
      condition: "good",
      description: "15-amp, sharp blade",
    });

    const publicRows = await t.query(api.tools.listPublic, {});
    expect(publicRows).toHaveLength(1);
    expect(publicRows[0]).toEqual({
      name: "Circular saw",
      category: "power_tools",
    });
    expect(publicRows[0]).not.toHaveProperty("_id");

    await t.run(async (ctx) => {
      const tool = await ctx.db
        .query("tools")
        .withIndex("by_owner", (q) => q.eq("ownerId", userId))
        .unique();
      if (!tool) {
        throw new Error("Expected seeded tool");
      }
      await ctx.db.patch(tool._id, { isAvailable: false });
    });

    const afterHide = await t.query(api.tools.listPublic, {});
    expect(afterHide).toHaveLength(0);
  });

  it("listPublic returns a pool of newest available tools for homepage pick", async () => {
    const t = createConvexTest();
    const { session } = await provisionUser(t, "lender@test.com");

    for (let i = 0; i < 7; i += 1) {
      await session.mutation(api.tools.create, {
        name: `Tool ${i}`,
        category: "other",
        condition: "good",
        description: "",
      });
    }

    const publicRows = await t.query(api.tools.listPublic, {});
    expect(publicRows).toHaveLength(7);
    expect(publicRows.map((row) => row.name)).toEqual([
      "Tool 6",
      "Tool 5",
      "Tool 4",
      "Tool 3",
      "Tool 2",
      "Tool 1",
      "Tool 0",
    ]);
  });

  it("create and listMine require authentication", async () => {
    const t = createConvexTest();

    await expect(
      t.query(api.tools.listMine, firstMyListingsPage()),
    ).rejects.toThrow();
    await expect(
      t.mutation(api.tools.create, {
        name: "Hammer",
        category: "other",
        condition: "excellent",
        description: "",
      }),
    ).rejects.toThrow();
  });

  it("remove allows owner and admin only", async () => {
    const t = createConvexTest();
    const { session: ownerSession } = await provisionUser(t, "owner@test.com");
    const { session: strangerSession } = await provisionUser(
      t,
      "stranger@test.com",
    );
    const { session: adminSession } = await provisionUser(t, ADMIN_EMAIL);

    const toolId = await ownerSession.mutation(api.tools.create, {
      name: "Ladder",
      category: "other",
      condition: "good",
      description: "6 ft",
    });

    await expect(
      strangerSession.mutation(api.tools.remove, { toolId }),
    ).rejects.toThrow();

    await adminSession.mutation(api.tools.remove, { toolId });

    const remaining = await t.query(api.tools.listPublic, {});
    expect(remaining).toHaveLength(0);
  });

  it("update allows owner to change listing details", async () => {
    const t = createConvexTest();
    const { session: ownerSession } = await provisionUser(t, "owner@test.com");
    const { session: strangerSession } = await provisionUser(
      t,
      "stranger@test.com",
    );

    const toolId = await ownerSession.mutation(api.tools.create, {
      name: "Leaf blower",
      category: "garden",
      condition: "good",
      description: "Gas powered",
    });

    await ownerSession.mutation(api.tools.update, {
      toolId,
      name: "Electric leaf blower",
      category: "power_tools",
      condition: "excellent",
      description: "Includes battery",
    });

    const mine = await ownerSession.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(mine.page).toHaveLength(1);
    expect(mine.page[0]).toMatchObject({
      _id: toolId,
      name: "Electric leaf blower",
      category: "power_tools",
      condition: "excellent",
      description: "Includes battery",
    });

    await expect(
      strangerSession.mutation(api.tools.update, {
        toolId,
        name: "Stolen",
        category: "other",
        condition: "good",
        description: "",
      }),
    ).rejects.toThrow();
  });

  it("listBoard excludes the viewer's listings so neighbor pages stay full", async () => {
    const t = createConvexTest();
    const { session: viewerSession } = await provisionUser(
      t,
      "viewer@test.com",
    );
    const { session: neighborSession } = await provisionUser(
      t,
      "neighbor@test.com",
    );

    await viewerSession.mutation(api.tools.create, {
      name: "My drill",
      category: "power_tools",
      condition: "good",
      description: "Mine",
    });

    for (let i = 0; i < 16; i += 1) {
      await neighborSession.mutation(api.tools.create, {
        name: `Neighbor tool ${i}`,
        category: "other",
        condition: "good",
        description: "",
      });
    }

    const board = await viewerSession.query(
      api.tools.listBoard,
      firstBoardPage(),
    );
    expect(board.page).toHaveLength(15);
    expect(board.page.every((row) => !row.isOwner)).toBe(true);
    expect(board.page.some((row) => row.name === "My drill")).toBe(false);
  });

  it("listBoard returns neighborhood details and setAvailability toggles board visibility", async () => {
    const t = createConvexTest();
    const { session: lenderSession, userId: lenderId } = await provisionUser(
      t,
      "lender@test.com",
    );
    const { session: neighborSession } = await provisionUser(
      t,
      "neighbor@test.com",
    );
    const { session: adminSession } = await provisionUser(t, ADMIN_EMAIL);

    const toolId = await lenderSession.mutation(api.tools.create, {
      name: "Pressure washer",
      category: "garden",
      condition: "excellent",
      description: "Includes hose and nozzle set",
    });

    const boardForNeighbor = await neighborSession.query(
      api.tools.listBoard,
      firstBoardPage(),
    );
    expect(boardForNeighbor.page).toHaveLength(1);
    expect(boardForNeighbor.page[0]).toMatchObject({
      _id: toolId,
      ownerId: lenderId,
      name: "Pressure washer",
      category: "garden",
      condition: "excellent",
      description: "Includes hose and nozzle set",
      ownerIsTrustedLender: false,
      isOwner: false,
      canRemove: false,
    });

    await adminSession.mutation(api.users.setTrustedLender, {
      userId: lenderId,
      isTrustedLender: true,
    });

    const boardForAdmin = await adminSession.query(
      api.tools.listBoard,
      firstBoardPage(),
    );
    expect(boardForAdmin.page[0]).toMatchObject({
      _id: toolId,
      ownerId: lenderId,
      ownerName: "lender@test.com",
      ownerIsTrustedLender: true,
      isOwner: false,
      canRemove: true,
    });

    await lenderSession.mutation(api.tools.setAvailability, {
      toolId,
      isAvailable: false,
    });

    const boardAfterPause = await neighborSession.query(
      api.tools.listBoard,
      firstBoardPage(),
    );
    expect(boardAfterPause.page).toHaveLength(0);
  });

  it("listBoard shows Neighbor instead of owner email when name is missing", async () => {
    const t = createConvexTest();
    const { session: lenderSession, userId: lenderId } = await provisionUser(
      t,
      "email-only-lender@lendloop.test",
      { name: "" },
    );
    await t.run(async (ctx) => {
      await ctx.db.patch(lenderId, { name: "", email: "email-only-lender@lendloop.test" });
    });

    await lenderSession.mutation(api.tools.create, {
      name: "Wheelbarrow",
      category: "garden",
      condition: "good",
      description: "",
    });

    const { session: neighborSession } = await provisionUser(
      t,
      "viewer@lendloop.test",
    );
    const board = await neighborSession.query(
      api.tools.listBoard,
      firstBoardPage(),
    );
    expect(board.page[0]?.ownerName).toBe("Neighbor");
    expect(board.page[0]?.ownerName).not.toContain("@");

    const { session: adminSession } = await provisionUser(t, ADMIN_EMAIL);
    const boardForAdmin = await adminSession.query(
      api.tools.listBoard,
      firstBoardPage(),
    );
    expect(boardForAdmin.page[0]?.ownerName).toBe(
      "email-only-lender@lendloop.test",
    );
  });

  it("listBoard surfaces pending and approved borrows for the viewer", async () => {
    const t = createConvexTest();
    const { session: lenderSession } = await provisionUser(
      t,
      "lender@test.com",
    );
    const { session: neighborSession } = await provisionUser(
      t,
      "neighbor@test.com",
    );

    const toolId = await lenderSession.mutation(api.tools.create, {
      name: "Ladder",
      category: "other",
      condition: "good",
      description: "8 ft",
    });

    await neighborSession.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-11-01",
      endDate: "2026-11-07",
    });

    const boardPending = await neighborSession.query(
      api.tools.listBoard,
      firstBoardPage(),
    );
    expect(boardPending.page[0]?.viewerBorrowStatus).toBe("pending");

    const lenderListings = await lenderSession.query(
      api.tools.listMine,
      firstMyListingsPage(),
    );
    expect(lenderListings.page[0]?.pendingRequestCount).toBe(1);
  });

  it("listBoard shows when a tool is out on loan until return date", async () => {
    const t = createConvexTest();
    const { session: lenderSession } = await provisionUser(
      t,
      "lender@test.com",
    );
    const { session: borrowerSession } = await provisionUser(
      t,
      "borrower@test.com",
    );
    const { session: neighborSession } = await provisionUser(
      t,
      "neighbor@test.com",
    );

    const toolId = await lenderSession.mutation(api.tools.create, {
      name: "Pressure washer",
      category: "garden",
      condition: "good",
      description: "",
    });

    const requestId = await borrowerSession.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-10-15",
      endDate: "2026-10-18",
    });
    await lenderSession.mutation(api.loanRequests.approve, { requestId });

    const board = await neighborSession.query(
      api.tools.listBoard,
      firstBoardPage(),
    );
    const row = board.page.find((tool) => tool._id === toolId);
    expect(row?.loanOutUntil).toBe("2026-10-18");
    expect(row?.bookedRanges).toEqual([
      { startDate: "2026-10-15", endDate: "2026-10-18" },
    ]);
  });

  it("blocks listing edit and remove while an approved borrow is overdue", async () => {
    const t = createConvexTest();
    const { session: lenderSession } = await provisionUser(
      t,
      "lender@test.com",
    );
    const { session: borrowerSession } = await provisionUser(
      t,
      "borrower@test.com",
    );

    const toolId = await lenderSession.mutation(api.tools.create, {
      name: "Circular saw",
      category: "power_tools",
      condition: "good",
      description: "",
    });

    const requestId = await borrowerSession.mutation(api.loanRequests.create, {
      toolId,
      startDate: "2026-10-15",
      endDate: "2026-10-20",
    });
    await lenderSession.mutation(api.loanRequests.approve, { requestId });

    await t.run(async (ctx) => {
      await ctx.db.patch(requestId, { endDate: "2026-10-14" });
    });

    await expect(
      lenderSession.mutation(api.tools.update, {
        toolId,
        name: "Renamed saw",
        category: "power_tools",
        condition: "good",
        description: "",
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );

    await expect(
      lenderSession.mutation(api.tools.remove, { toolId }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.VALIDATION_ERROR,
    );
  });
});
