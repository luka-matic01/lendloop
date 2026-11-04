import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./lib/auth";
import { AuthErrorCode, authError } from "./lib/errors";
import {
  clerkDisplayName,
  resolveAccountEmail,
  userDisplayName,
} from "./lib/userDisplayName";
import { isBootstrapAdmin } from "./lib/bootstrapAdmins";
import { resolveIdentityEmailVerified } from "./lib/emailVerified";
import { userRoleValidator } from "./lib/validators";

/**
 * Bootstrap list grants admin on sync; promoted admins keep role until
 * another admin calls setUserRole.
 */
function resolveRole(
  jwtEmail: string,
  emailVerified: boolean,
  existingRole?: "admin" | "user",
): "admin" | "user" {
  if (isBootstrapAdmin(jwtEmail, emailVerified)) {
    return "admin";
  }
  if (existingRole === "admin") {
    return "admin";
  }
  return "user";
}

export const ensureCurrentUser = mutation({
  args: {
    /** Ignored — kept so stale browser bundles do not fail validation. */
    primaryEmail: v.optional(v.string()),
    primaryEmailVerified: v.optional(v.boolean()),
  },
  returns: v.id("users"),
  handler: async (ctx) => {
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

    const jwtEmail = resolveAccountEmail({ jwtEmail: identity.email });
    const email = resolveAccountEmail({
      jwtEmail: identity.email,
      storedEmail: existing?.email,
    });
    let name =
      clerkDisplayName(identity.name) ||
      clerkDisplayName(existing?.name) ||
      "";
    if (name && email && name.toLowerCase() === email) {
      name = "";
    }
    const role = resolveRole(
      jwtEmail,
      resolveIdentityEmailVerified(identity),
      existing?.role,
    );

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

export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: userRoleValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);

    if (!target) {
      authError(AuthErrorCode.NOT_FOUND, "User not found");
    }

    if (target._id === admin._id && args.role === "user") {
      authError(
        AuthErrorCode.FORBIDDEN,
        "Ask another admin to demote your account",
      );
    }

    if (target.role !== args.role) {
      await ctx.db.patch(args.userId, { role: args.role });
    }
    return null;
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
