/// <reference types="vite/client" />

import { describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import { AuthErrorCode } from "./lib/errors";
import {
  ADMIN_EMAIL,
  createConvexTest,
  errorCode,
  useAdminBootstrapEnv,
} from "../convex-test/helpers";

describe("users RBAC", () => {
  useAdminBootstrapEnv();

  it("rejects unauthenticated ensureCurrentUser and me", async () => {
    const t = createConvexTest();

    await expect(t.mutation(api.users.ensureCurrentUser, {})).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.UNAUTHENTICATED,
    );

    await expect(t.query(api.users.me, {})).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.UNAUTHENTICATED,
    );
  });

  it("creates a user idempotently on ensureCurrentUser", async () => {
    const t = createConvexTest();
    const asNeighbor = t.withIdentity({
      email: "neighbor@test.com",
      emailVerified: true,
      name: "Neighbor",
    });

    const firstId = await asNeighbor.mutation(api.users.ensureCurrentUser, {});
    const secondId = await asNeighbor.mutation(api.users.ensureCurrentUser, {});

    expect(firstId).toEqual(secondId);

    const stored = await t.run(async (ctx) => ctx.db.get(firstId));
    expect(stored?.email).toBe("neighbor@test.com");
    expect(stored?.name).toBe("");

    const rowCount = await t.run(async (ctx) => {
      const rows = await ctx.db.query("users").collect();
      return rows.length;
    });
    expect(rowCount).toBe(1);
  });

  it("ignores client primaryEmail when the JWT omits email", async () => {
    const t = createConvexTest();
    const session = t.withIdentity({
      name: "Neighbor",
    });

    const userId = await session.mutation(api.users.ensureCurrentUser, {
      primaryEmail: "borrower@example.com",
    });

    const stored = await t.run(async (ctx) => ctx.db.get(userId));
    expect(stored).toMatchObject({
      email: "",
      name: "",
    });
  });

  it("does not promote admin from client email when JWT is verified but omits email", async () => {
    const t = createConvexTest();
    const session = t.withIdentity({
      emailVerified: true,
    });

    await session.mutation(api.users.ensureCurrentUser, {
      primaryEmail: ADMIN_EMAIL,
    });

    const profile = await session.query(api.users.me, {});
    expect(profile.role).toBe("user");
  });

  it("promotes to admin when JWT email matches INITIAL_ADMIN_EMAIL", async () => {
    const t = createConvexTest();

    const session = t.withIdentity({
      email: ADMIN_EMAIL,
      emailVerified: false,
    });
    await session.mutation(api.users.ensureCurrentUser, {});
    const profile = await session.query(api.users.me, {});
    expect(profile.role).toBe("admin");
  });

  it("does not promote admin from client-supplied email when JWT email differs", async () => {
    const t = createConvexTest();
    const session = t.withIdentity({
      email: "neighbor@test.com",
      emailVerified: false,
    });

    await session.mutation(api.users.ensureCurrentUser, {
      primaryEmail: ADMIN_EMAIL,
      primaryEmailVerified: true,
    });

    const profile = await session.query(api.users.me, {});
    expect(profile.role).toBe("user");
  });

  it("forbids non-admin setTrustedLender", async () => {
    const t = createConvexTest();

    const asUser = t.withIdentity({
      email: "borrower@test.com",
      emailVerified: true,
    });
    const userId = await asUser.mutation(api.users.ensureCurrentUser, {});

    await expect(
      asUser.mutation(api.users.setTrustedLender, {
        userId,
        isTrustedLender: true,
      }),
    ).rejects.toSatisfy(
      (err: unknown) => errorCode(err) === AuthErrorCode.FORBIDDEN,
    );
  });

  it("promotes multiple bootstrap emails from env", async () => {
    const t = createConvexTest();
    vi.stubEnv("INITIAL_ADMIN_EMAIL", `${ADMIN_EMAIL},other-admin@lendloop.test`);

    const other = t.withIdentity({
      email: "other-admin@lendloop.test",
      emailVerified: true,
    });
    await other.mutation(api.users.ensureCurrentUser, {});
    expect((await other.query(api.users.me, {})).role).toBe("admin");
  });

  it("demotes admin via setUserRole", async () => {
    const t = createConvexTest();

    const asAdmin = t.withIdentity({
      email: ADMIN_EMAIL,
      emailVerified: true,
    });
    await asAdmin.mutation(api.users.ensureCurrentUser, {});

    const asUser = t.withIdentity({
      email: "member@lendloop.test",
      emailVerified: true,
    });
    const memberId = await asUser.mutation(api.users.ensureCurrentUser, {});

    await asAdmin.mutation(api.users.setUserRole, {
      userId: memberId,
      role: "admin",
    });
    expect((await asUser.query(api.users.me, {})).role).toBe("admin");

    await asAdmin.mutation(api.users.setUserRole, {
      userId: memberId,
      role: "user",
    });
    expect((await asUser.query(api.users.me, {})).role).toBe("user");
  });

  it("allows admin setTrustedLender", async () => {
    const t = createConvexTest();

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
