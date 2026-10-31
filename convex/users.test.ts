/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { AuthErrorCode } from "./lib/errors";

const modules = import.meta.glob(["./**/*.ts", "!./**/*.test.ts"]);

const ADMIN_EMAIL = "admin@lendloop.test";

function errorCode(error: unknown): string | undefined {
  if (error instanceof ConvexError) {
    const data = error.data as { code?: string };
    return data.code;
  }
  return undefined;
}

describe("users RBAC", () => {
  beforeEach(() => {
    vi.stubEnv("INITIAL_ADMIN_EMAIL", ADMIN_EMAIL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects unauthenticated ensureCurrentUser and me", async () => {
    const t = convexTest(schema, modules);

    await expect(t.mutation(api.users.ensureCurrentUser, {})).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.UNAUTHENTICATED
    );

    await expect(t.query(api.users.me, {})).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.UNAUTHENTICATED
    );
  });

  it("creates a user idempotently on ensureCurrentUser", async () => {
    const t = convexTest(schema, modules);
    const asNeighbor = t.withIdentity({
      email: "neighbor@test.com",
      emailVerified: true,
      name: "Neighbor",
    });

    const firstId = await asNeighbor.mutation(api.users.ensureCurrentUser, {});
    const secondId = await asNeighbor.mutation(api.users.ensureCurrentUser, {});

    expect(firstId).toEqual(secondId);

    const rowCount = await t.run(async (ctx) => {
      const rows = await ctx.db.query("users").collect();
      return rows.length;
    });
    expect(rowCount).toBe(1);
  });

  it("promotes to admin only when bootstrap email is verified", async () => {
    const t = convexTest(schema, modules);

    const unverified = t.withIdentity({
      email: ADMIN_EMAIL,
      emailVerified: false,
    });
    await unverified.mutation(api.users.ensureCurrentUser, {});
    const unverifiedProfile = await unverified.query(api.users.me, {});
    expect(unverifiedProfile.role).toBe("user");

    const verified = t.withIdentity({
      email: ADMIN_EMAIL,
      emailVerified: true,
    });
    await verified.mutation(api.users.ensureCurrentUser, {});
    const verifiedProfile = await verified.query(api.users.me, {});
    expect(verifiedProfile.role).toBe("admin");
  });

  it("forbids non-admin setTrustedLender", async () => {
    const t = convexTest(schema, modules);

    const asUser = t.withIdentity({
      email: "borrower@test.com",
      emailVerified: true,
    });
    const userId = await asUser.mutation(api.users.ensureCurrentUser, {});

    await expect(
      asUser.mutation(api.users.setTrustedLender, {
        userId,
        isTrustedLender: true,
      })
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN
    );
  });

  it("allows admin setTrustedLender", async () => {
    const t = convexTest(schema, modules);

    const asAdmin = t.withIdentity({
      email: ADMIN_EMAIL,
      emailVerified: true,
    });
    await asAdmin.mutation(api.users.ensureCurrentUser, {});

    const asUser = t.withIdentity({
      email: "lender@test.com",
      emailVerified: true,
    });
    const userId = await asUser.mutation(api.users.ensureCurrentUser, {});

    await asAdmin.mutation(api.users.setTrustedLender, {
      userId,
      isTrustedLender: true,
    });

    const updated = await t.run(async (ctx) => ctx.db.get(userId));
    expect(updated?.isTrustedLender).toBe(true);
  });
});
