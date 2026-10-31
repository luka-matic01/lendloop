/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "!./**/*.test.ts"]);

async function provisionUser(
  t: ReturnType<typeof convexTest>,
  email: string
) {
  const session = t.withIdentity({ email, emailVerified: true, name: email });
  const userId = await session.mutation(api.users.ensureCurrentUser, {});
  return { session, userId };
}

describe("tools", () => {
  beforeEach(() => {
    vi.stubEnv("INITIAL_ADMIN_EMAIL", "admin@lendloop.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("listPublic returns only name and category for available tools", async () => {
    const t = convexTest(schema, modules);
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

  it("listPublic returns at most five newest available tools", async () => {
    const t = convexTest(schema, modules);
    const { session } = await provisionUser(t, "lender@test.com");

    for (let i = 0; i < 6; i += 1) {
      await session.mutation(api.tools.create, {
        name: `Tool ${i}`,
        category: "other",
        condition: "good",
        description: "",
      });
    }

    const publicRows = await t.query(api.tools.listPublic, {});
    expect(publicRows).toHaveLength(5);
    expect(publicRows.map((row) => row.name)).toEqual([
      "Tool 5",
      "Tool 4",
      "Tool 3",
      "Tool 2",
      "Tool 1",
    ]);
  });

  it("create and listMine require authentication", async () => {
    const t = convexTest(schema, modules);

    await expect(t.query(api.tools.listMine, {})).rejects.toThrow();
    await expect(
      t.mutation(api.tools.create, {
        name: "Hammer",
        category: "other",
        condition: "excellent",
        description: "",
      })
    ).rejects.toThrow();
  });

  it("remove allows owner and admin only", async () => {
    const t = convexTest(schema, modules);
    const { session: ownerSession } = await provisionUser(t, "owner@test.com");
    const { session: strangerSession } = await provisionUser(
      t,
      "stranger@test.com"
    );
    const { session: adminSession } = await provisionUser(
      t,
      "admin@lendloop.test"
    );

    const toolId = await ownerSession.mutation(api.tools.create, {
      name: "Ladder",
      category: "other",
      condition: "good",
      description: "6 ft",
    });

    await expect(
      strangerSession.mutation(api.tools.remove, { toolId })
    ).rejects.toThrow();

    await adminSession.mutation(api.tools.remove, { toolId });

    const remaining = await t.query(api.tools.listPublic, {});
    expect(remaining).toHaveLength(0);
  });

  it("listBoard returns neighborhood details and setAvailability toggles board visibility", async () => {
    const t = convexTest(schema, modules);
    const { session: lenderSession } = await provisionUser(t, "lender@test.com");
    const { session: neighborSession } = await provisionUser(
      t,
      "neighbor@test.com"
    );

    const toolId = await lenderSession.mutation(api.tools.create, {
      name: "Pressure washer",
      category: "garden",
      condition: "excellent",
      description: "Includes hose and nozzle set",
    });

    const boardForNeighbor = await neighborSession.query(
      api.tools.listBoard,
      {}
    );
    expect(boardForNeighbor).toHaveLength(1);
    expect(boardForNeighbor[0]).toMatchObject({
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
      {}
    );
    expect(boardAfterPause).toHaveLength(0);
  });
});
