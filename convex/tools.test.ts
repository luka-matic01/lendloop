/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import {
  firstBoardPage,
  firstMyListingsPage,
} from "../convex-test/pagination";
import {
  ADMIN_EMAIL,
  createConvexTest,
  provisionUser,
  useAdminBootstrapEnv,
} from "../convex-test/helpers";

describe("tools", () => {
  useAdminBootstrapEnv();

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
      _id: expect.any(String),
      name: "Circular saw",
      category: "power_tools",
    });

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

  it("listBoard returns neighborhood details and setAvailability toggles board visibility", async () => {
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
      name: "Pressure washer",
      category: "garden",
      condition: "excellent",
      description: "Includes hose and nozzle set",
      isOwner: false,
      canRemove: false,
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
});
