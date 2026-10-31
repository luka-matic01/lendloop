import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

import { AuthErrorCode, authError } from "./errors";

type AuthCtx = QueryCtx | MutationCtx;

export async function getCurrentUser(
  ctx: AuthCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
}

export async function requireUser(ctx: AuthCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    authError(AuthErrorCode.UNAUTHENTICATED);
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    authError(AuthErrorCode.USER_NOT_PROVISIONED);
  }

  return user;
}

export async function requireAdmin(ctx: AuthCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "admin") {
    authError(AuthErrorCode.FORBIDDEN, "Admin role required");
  }
  return user;
}

export function assertOwner(
  user: Doc<"users">,
  ownerId: Id<"users">
): void {
  if (user._id !== ownerId) {
    authError(AuthErrorCode.FORBIDDEN, "Resource owner required");
  }
}
