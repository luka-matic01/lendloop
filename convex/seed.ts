import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { primaryBootstrapAdminEmail } from "./lib/bootstrapAdmins";
import { utcTodayIso } from "./lib/borrowDates";
import {
  personalDemoTools,
  SEED_OWNER,
  SEED_USER_TOKEN_PREFIX,
  seedDemoLoans as seedDemoLoanRows,
  seedNeighbors,
} from "./lib/seedFixtures";

const personalDemoToolNames = new Set(
  personalDemoTools.map((tool) => tool.name),
);

const seedResultValidator = v.object({
  neighborUsers: v.number(),
  neighborTools: v.number(),
  personalTools: v.number(),
  demoOpenLoans: v.number(),
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

async function findSeedNeighbor(ctx: MutationCtx, slug: string) {
  return ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", `${SEED_USER_TOKEN_PREFIX}${slug}`),
    )
    .unique();
}

async function findToolForOwner(
  ctx: MutationCtx,
  ownerId: Id<"users">,
  toolName: string,
) {
  const tools = await ctx.db
    .query("tools")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .collect();
  return tools.find((tool) => tool.name === toolName) ?? null;
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

async function resolveSeedPartyId(
  ctx: MutationCtx,
  slug: string,
  personalOwnerId: Id<"users"> | null,
): Promise<Id<"users"> | null> {
  if (slug === SEED_OWNER) {
    return personalOwnerId;
  }
  const user = await findSeedNeighbor(ctx, slug);
  return user?._id ?? null;
}

async function insertSeedDemoLoans(
  ctx: MutationCtx,
  personalOwnerId: Id<"users"> | null,
  nowMs: number,
) {
  let inserted = 0;

  for (const row of seedDemoLoanRows) {
    if (
      (row.lender === SEED_OWNER || row.borrower === SEED_OWNER) &&
      !personalOwnerId
    ) {
      continue;
    }

    const lenderId = await resolveSeedPartyId(ctx, row.lender, personalOwnerId);
    const borrowerId = await resolveSeedPartyId(
      ctx,
      row.borrower,
      personalOwnerId,
    );
    if (!lenderId || !borrowerId) {
      continue;
    }

    const tool = await findToolForOwner(ctx, lenderId, row.toolName);
    if (!tool) {
      continue;
    }

    const loanRequestId = await ctx.db.insert("loanRequests", {
      toolId: tool._id,
      borrowerId,
      lenderId,
      startDate: isoDaysFromToday(row.startDayOffset, nowMs),
      endDate: isoDaysFromToday(row.endDayOffset, nowMs),
      status: row.status,
      requestNotifiedAt:
        row.requestNotifiedHoursAgo !== undefined
          ? nowMs - row.requestNotifiedHoursAgo * 3_600_000
          : undefined,
      statusDecidedAt:
        row.statusDecidedDaysAgo !== undefined
          ? nowMs - row.statusDecidedDaysAgo * 86_400_000
          : undefined,
      lastReminderSentAt:
        row.lastReminderDaysAgo !== undefined
          ? nowMs - row.lastReminderDaysAgo * 86_400_000
          : undefined,
    });

    inserted += 1;
  }

  return inserted;
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
    const nowMs = Date.now();
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
    let personalOwnerId: Id<"users"> | null = null;

    if (!personalOwnerEmail) {
      hint =
        "Set INITIAL_ADMIN_EMAIL in Convex (or pass ownerEmail) and sign in once, then run seed again for your demo listings.";
    } else {
      const owner = await findUserByEmail(ctx, personalOwnerEmail);
      if (!owner) {
        hint = `No Convex user with email ${personalOwnerEmail} yet. Sign in once in the app, then run npm run seed again.`;
      } else {
        personalOwnerId = owner._id;
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
      }
    }

    const demoOpenLoans = await insertSeedDemoLoans(
      ctx,
      personalOwnerId,
      nowMs,
    );

    return {
      neighborUsers: seedNeighbors.length,
      neighborTools,
      personalTools,
      demoOpenLoans,
      personalOwnerEmail,
      hint,
    };
  },
});
