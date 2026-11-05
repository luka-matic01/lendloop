/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import { internal } from "./_generated/api";
import { api } from "./_generated/api";
import {
  ADMIN_EMAIL,
  createConvexTest,
  provisionUser,
  useAdminBootstrapEnv,
  useBorrowTestClock,
} from "../convex-test/helpers";
import { personalDemoTools } from "./lib/seedFixtures";

describe("seed", () => {
  useAdminBootstrapEnv();
  useBorrowTestClock("2026-10-15T12:00:00.000Z");

  it("inserts neighbor board tools and personal demo listings for a signed-in user", async () => {
    const t = createConvexTest();
    const email = "reviewer@lendloop.test";
    const { session, userId } = await provisionUser(t, email);

    const first = await t.mutation(internal.seed.run, {
      ownerEmail: email,
    });
    expect(first.neighborTools).toBeGreaterThan(24);
    expect(first.personalTools).toBe(3);
    expect(first.demoOpenLoans).toBe(8);
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

  it("seeds open demo loans for admin, incoming, my requests, and neighbor-only rows", async () => {
    const t = createConvexTest();
    const { session: admin } = await provisionUser(t, ADMIN_EMAIL);

    await t.mutation(internal.seed.run, {
      ownerEmail: ADMIN_EMAIL,
    });

    const incoming = await admin.query(api.loanRequests.listIncomingRequests, {});
    const incomingOpen = incoming.filter(
      (row) =>
        row.status === "pending" ||
        row.status === "approved",
    );
    expect(incomingOpen.some((row) => row.status === "pending")).toBe(true);
    expect(
      incomingOpen.some(
        (row) =>
          row.status === "approved" &&
          row.toolName === "Socket set",
      ),
    ).toBe(true);
    expect(
      incomingOpen.some((row) => row.toolName === "6 ft step ladder"),
    ).toBe(true);

    const mine = await admin.query(api.loanRequests.listMyRequests, {});
    const mineOpen = mine.filter(
      (row) =>
        row.status === "pending" ||
        row.status === "approved",
    );
    expect(mineOpen.some((row) => row.status === "pending")).toBe(true);
    expect(
      mineOpen.some(
        (row) =>
          row.status === "approved" && row.toolName === "Circular saw",
      ),
    ).toBe(true);
    expect(
      mineOpen.some(
        (row) =>
          row.status === "approved" && row.toolName === "Angle grinder",
      ),
    ).toBe(true);

    const allLoans = await admin.query(api.loanRequests.listAllForAdmin, {});
    const neighborOnly = allLoans.filter(
      (row) =>
        row.borrowerName === "James K." && row.lenderName === "Priya N.",
    );
    expect(neighborOnly.some((row) => row.status === "pending")).toBe(true);
    expect(
      allLoans.some(
        (row) =>
          row.borrowerName === "Omar H." &&
          row.lenderName === "Priya N." &&
          row.status === "approved",
      ),
    ).toBe(true);
    expect(allLoans.every((row) => row.latestAutomation === undefined)).toBe(
      true,
    );
    expect(allLoans.every((row) => row.status !== "returned")).toBe(true);
    expect(allLoans.every((row) => row.status !== "declined")).toBe(true);
    expect(allLoans.every((row) => row.status !== "cancelled")).toBe(true);
  });
});
