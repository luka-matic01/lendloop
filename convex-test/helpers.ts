/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { afterEach, beforeEach, vi } from "vitest";

import { api } from "../convex/_generated/api";
import schema from "../convex/schema";

export const ADMIN_EMAIL = "admin@lendloop.test";

export const convexModules = import.meta.glob([
  "../convex/**/*.ts",
  "!../convex/**/*.test.ts",
]);

export type ConvexTestInstance = ReturnType<typeof convexTest>;

export function createConvexTest() {
  return convexTest(schema, convexModules);
}

export async function provisionUser(
  t: ConvexTestInstance,
  email: string,
  options?: { emailVerified?: boolean; name?: string },
) {
  const session = t.withIdentity({
    email,
    emailVerified: options?.emailVerified ?? true,
    name: options?.name ?? email,
  });
  const userId = await session.mutation(api.users.ensureCurrentUser, {});
  return { session, userId };
}

export function errorCode(error: unknown): string | undefined {
  if (error instanceof ConvexError) {
    const data = error.data as { code?: string };
    return data.code;
  }
  return undefined;
}

/** Call once at the top of a `describe` block. */
export function useAdminBootstrapEnv() {
  beforeEach(() => {
    vi.stubEnv("INITIAL_ADMIN_EMAIL", ADMIN_EMAIL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });
}

/** Fixed UTC clock so borrow dates in tests stay in the future. */
export function useBorrowTestClock(isoDate = "2026-10-15T12:00:00.000Z") {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(isoDate));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}
