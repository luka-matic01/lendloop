/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import { internal } from "./_generated/api";
import { api } from "./_generated/api";
import {
  createConvexTest,
  provisionUser,
  useAdminBootstrapEnv,
} from "../convex-test/helpers";
import { personalDemoTools } from "./lib/seedFixtures";

describe("seed", () => {
  useAdminBootstrapEnv();

  it("inserts neighbor board tools and personal demo listings for a signed-in user", async () => {
    const t = createConvexTest();
    const email = "reviewer@lendloop.test";
    const { session, userId } = await provisionUser(t, email);

    const first = await t.mutation(internal.seed.run, {
      ownerEmail: email,
    });
    expect(first.neighborTools).toBeGreaterThan(24);
    expect(first.personalTools).toBe(3);
    expect(first.hint).toBeNull();

    const board = await session.query(api.tools.listBoard, {
      paginationOpts: { numItems: 50, cursor: null },
    });
    expect(board.page.length).toBeGreaterThan(24);
    expect(board.page.some((row) => row.ownerName === "Maria S.")).toBe(true);

    const mine = await session.query(api.tools.listMine, {
      paginationOpts: { numItems: 50, cursor: null },
    });
    const expectedPersonalNames = personalDemoTools.map((tool) => tool.name).sort();
    expect(mine.page.map((row) => row.name).sort()).toEqual(expectedPersonalNames);

    await session.mutation(api.tools.create, {
      name: "Personal tile cutter",
      category: "power_tools",
      condition: "good",
      description: "User-owned listing; seed must not remove this.",
    });

    const second = await t.mutation(internal.seed.run, {
      ownerEmail: email,
    });
    expect(second.neighborTools).toBe(first.neighborTools);

    const mineAgain = await session.query(api.tools.listMine, {
      paginationOpts: { numItems: 50, cursor: null },
    });
    expect(mineAgain.page.length).toBe(4);
    expect(mineAgain.page.map((row) => row.name).sort()).toEqual(
      [...expectedPersonalNames, "Personal tile cutter"].sort(),
    );

    const userRow = await t.run(async (ctx) => ctx.db.get(userId));
    expect(userRow?.tokenIdentifier.startsWith("seed|")).toBe(false);
  });
});
