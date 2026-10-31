import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { AuthErrorCode, authError } from "./lib/errors";
import { requireAdmin, requireUser } from "./lib/auth";

function normalizeEmail(email: string | undefined): string {
  return email?.trim().toLowerCase() ?? "";
}

function isEmailVerified(identity: {
  emailVerified?: boolean | string | null;
}): boolean {
  const verified = identity.emailVerified;
  return verified === true || verified === "true";
}

function shouldPromoteToAdmin(
  email: string,
  emailVerified: boolean,
  existingRole: "admin" | "user" | undefined
): "admin" | "user" {
  if (existingRole === "admin") {
    return "admin";
  }

  const bootstrapEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (!bootstrapEmail || !emailVerified || email !== bootstrapEmail) {
    return existingRole ?? "user";
  }

  return "admin";
}

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      authError(AuthErrorCode.UNAUTHENTICATED);
    }

    const tokenIdentifier = identity.tokenIdentifier;
    const email = normalizeEmail(identity.email);
    const name = identity.name?.trim() || email || "Neighbor";
    const emailVerified = isEmailVerified(identity);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    const role = shouldPromoteToAdmin(email, emailVerified, existing?.role);

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name,
        role,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier,
      email,
      name,
      role,
      isTrustedLender: false,
    });
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return {
      _id: user._id,
      name: user.name,
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
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, { isTrustedLender: args.isTrustedLender });
  },
});
