import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { primaryBootstrapAdminEmail } from "./lib/bootstrapAdmins";
import { utcTodayIso } from "./lib/borrowDates";
import {
  personalDemoTools,
  SEED_USER_TOKEN_PREFIX,
  seedNeighbors,
} from "./lib/seedFixtures";

const personalDemoToolNames = new Set(
  personalDemoTools.map((tool) => tool.name),
);

const seedResultValidator = v.object({
  neighborUsers: v.number(),
  neighborTools: v.number(),
  personalTools: v.number(),
  personalOwnerEmail: v.union(v.string(), v.null()),
  hint: v.union(v.string(), v.null()),
});

async function deleteLoanRequestCascade(
  ctx: MutationCtx,
  loanRequestId: Id<"loanRequests">,
) {
  const logs = await ctx.db
    .query("automationLogs")
    .withIndex("by_loan", (q) => q.eq("loanRequestId", loanRequestId))
    .collect();
  for (const log of logs) {
    await ctx.db.delete(log._id);
  }
  await ctx.db.delete(loanRequestId);
}

async function deleteToolsForOwner(ctx: MutationCtx, ownerId: Id<"users">) {
  const tools = await ctx.db
    .query("tools")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .collect();

  for (const tool of tools) {
    const requests = await ctx.db
      .query("loanRequests")
      .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
      .collect();
    for (const request of requests) {
      await deleteLoanRequestCascade(ctx, request._id);
    }
    await ctx.db.delete(tool._id);
  }
}

async function findUserByEmail(ctx: MutationCtx, email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  const users = await ctx.db.query("users").collect();
  return users.find((user) => user.email.trim().toLowerCase() === normalized) ?? null;
}

async function clearSeedNeighbors(ctx: MutationCtx) {
  const users = await ctx.db.query("users").collect();
  const seedUsers = users.filter((user) =>
    user.tokenIdentifier.startsWith(SEED_USER_TOKEN_PREFIX),
  );

  for (const user of seedUsers) {
    await deleteToolsForOwner(ctx, user._id);
    await ctx.db.delete(user._id);
  }
}

async function clearPersonalDemoListings(
  ctx: MutationCtx,
  ownerId: Id<"users">,
) {
  const tools = await ctx.db
    .query("tools")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .collect();

  for (const tool of tools) {
    if (!personalDemoToolNames.has(tool.name)) {
      continue;
    }
    const requests = await ctx.db
      .query("loanRequests")
      .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
      .collect();
    for (const request of requests) {
      await deleteLoanRequestCascade(ctx, request._id);
    }
    await ctx.db.delete(tool._id);
  }
}

function isoDaysFromToday(offsetDays: number, nowMs = Date.now()): string {
  const base = Date.parse(`${utcTodayIso(nowMs)}T00:00:00Z`);
  const shifted = new Date(base + offsetDays * 86_400_000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function seedAutomationDemoLoans(
  ctx: MutationCtx,
  ownerId: Id<"users">,
) {
  const users = await ctx.db.query("users").collect();
  const maria = users.find((user) =>
    user.tokenIdentifier.endsWith("maria-s"),
  );
  if (!maria) {
    return;
  }

  const mariaTools = await ctx.db
    .query("tools")
    .withIndex("by_owner", (q) => q.eq("ownerId", maria._id))
    .collect();
  const mariaLendable = mariaTools.find((tool) => tool.name === "Circular saw");
  if (mariaLendable) {
    await ctx.db.insert("loanRequests", {
      toolId: mariaLendable._id,
      borrowerId: ownerId,
      lenderId: maria._id,
      startDate: isoDaysFromToday(-12),
      endDate: isoDaysFromToday(-4),
      status: "approved",
    });
  }

  const ownerTools = await ctx.db
    .query("tools")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .collect();
  const toolByName = (name: string) =>
    ownerTools.find((tool) => tool.name === name);

  const demoDrill = toolByName("Cordless drill");
  if (demoDrill) {
    await ctx.db.insert("loanRequests", {
      toolId: demoDrill._id,
      borrowerId: maria._id,
      lenderId: ownerId,
      startDate: isoDaysFromToday(0),
      endDate: isoDaysFromToday(3),
      status: "pending",
    });
  }

  const demoLadder = toolByName("6 ft step ladder");
  if (demoLadder) {
    await ctx.db.insert("loanRequests", {
      toolId: demoLadder._id,
      borrowerId: maria._id,
      lenderId: ownerId,
      startDate: isoDaysFromToday(5),
      endDate: isoDaysFromToday(8),
      status: "pending",
    });
  }
}

function resolveOwnerEmail(argsOwnerEmail?: string): string | null {
  const fromArgs = argsOwnerEmail?.trim().toLowerCase();
  if (fromArgs) {
    return fromArgs;
  }
  return primaryBootstrapAdminEmail();
}

export const run = internalMutation({
  args: {
    /** Clerk account email for “My listings” demo rows. Defaults to INITIAL_ADMIN_EMAIL. */
    ownerEmail: v.optional(v.string()),
  },
  returns: seedResultValidator,
  handler: async (ctx, args) => {
    await clearSeedNeighbors(ctx);

    let neighborTools = 0;
    for (const neighbor of seedNeighbors) {
      const ownerId = await ctx.db.insert("users", {
        tokenIdentifier: `${SEED_USER_TOKEN_PREFIX}${neighbor.slug}`,
        email: neighbor.email,
        name: neighbor.name,
        role: "user",
        isTrustedLender: neighbor.isTrustedLender ?? false,
      });

      for (const tool of neighbor.tools) {
        await ctx.db.insert("tools", {
          ownerId,
          name: tool.name,
          category: tool.category,
          condition: tool.condition,
          description: tool.description,
          isAvailable: tool.isAvailable ?? true,
        });
        neighborTools += 1;
      }
    }

    const personalOwnerEmail = resolveOwnerEmail(args.ownerEmail);
    let personalTools = 0;
    let hint: string | null = null;

    if (!personalOwnerEmail) {
      hint =
        "Set INITIAL_ADMIN_EMAIL in Convex (or pass ownerEmail) and sign in once, then run seed again for your demo listings.";
    } else {
      const owner = await findUserByEmail(ctx, personalOwnerEmail);
      if (!owner) {
        hint = `No Convex user with email ${personalOwnerEmail} yet. Sign in once in the app, then run npm run seed again.`;
      } else {
        await clearPersonalDemoListings(ctx, owner._id);
        for (const tool of personalDemoTools) {
          await ctx.db.insert("tools", {
            ownerId: owner._id,
            name: tool.name,
            category: tool.category,
            condition: tool.condition,
            description: tool.description,
            isAvailable: tool.isAvailable ?? true,
          });
          personalTools += 1;
        }
        await seedAutomationDemoLoans(ctx, owner._id);
      }
    }

    return {
      neighborUsers: seedNeighbors.length,
      neighborTools,
      personalTools,
      personalOwnerEmail,
      hint,
    };
  },
});
