import { v } from "convex/values";

import { env, mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./lib/auth";
import { AuthErrorCode, authError } from "./lib/errors";
import {
  clerkDisplayName,
  resolveAccountEmail,
  userDisplayName,
} from "./lib/userDisplayName";
import { resolveAccountEmailVerified } from "./lib/emailVerified";
import { userRoleValidator } from "./lib/validators";

function resolveRole(
  email: string,
  emailVerified: boolean,
  existingRole?: "admin" | "user",
): "admin" | "user" {
  if (existingRole === "admin") return "admin";
  const bootstrapEmail = env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrapEmail && emailVerified && email === bootstrapEmail) {
    return "admin";
  }
  return existingRole ?? "user";
}

export const ensureCurrentUser = mutation({
  args: {
    /** When the Convex JWT omits email, pass Clerk's primary address from the client. */
    primaryEmail: v.optional(v.string()),
    /** Clerk primary email verification when the JWT omits `email_verified`. */
    primaryEmailVerified: v.optional(v.boolean()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      authError(AuthErrorCode.UNAUTHENTICATED);
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    const email = resolveAccountEmail({
      jwtEmail: identity.email,
      clientEmail: args.primaryEmail,
      storedEmail: existing?.email,
    });
    let name =
      clerkDisplayName(identity.name) ||
      clerkDisplayName(existing?.name) ||
      "";
    if (name && email && name.toLowerCase() === email) {
      name = "";
    }
    const emailVerified = resolveAccountEmailVerified({
      identity,
      resolvedEmail: email,
      primaryEmail: args.primaryEmail,
      primaryEmailVerified: args.primaryEmailVerified,
    });
    const role = resolveRole(email, emailVerified, existing?.role);

    if (existing) {
      if (
        existing.email !== email ||
        existing.name !== name ||
        existing.role !== role
      ) {
        await ctx.db.patch(existing._id, { email, name, role });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      email,
      name,
      role,
      isTrustedLender: false,
    });
  },
});

export const me = query({
  args: {},
  returns: v.object({
    _id: v.id("users"),
    name: v.string(),
    role: userRoleValidator,
    isTrustedLender: v.boolean(),
  }),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return {
      _id: user._id,
      name: userDisplayName(user),
      role: user.role,
      isTrustedLender: user.isTrustedLender,
    };
  },
});

export const setTrustedLender = mutation({
  args: {
    userId: v.id("users"),
    isTrustedLender: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const [, target] = await Promise.all([
      requireAdmin(ctx),
      ctx.db.get(args.userId),
    ]);

    if (!target) {
      authError(AuthErrorCode.NOT_FOUND, "User not found");
    }

    await ctx.db.patch(args.userId, { isTrustedLender: args.isTrustedLender });
    return null;
  },
});
