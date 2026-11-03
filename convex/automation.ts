import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
  env,
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { signPayload, SIGNATURE_HEADER } from "./lib/hmac";
import { userDisplayName } from "./lib/userDisplayName";
import { loanRequestStatusValidator } from "./lib/validators";

const REQUEST_KIND = "request_notification";
const OVERDUE_KIND = "overdue_reminder";
const OVERDUE_LIST_CAP = 100;
const NOTIFY_ATTEMPTS = 3;

const notifyRoleValidator = v.union(v.literal("borrower"), v.literal("lender"));

const notifyPayloadValidator = v.object({
  event: v.union(
    v.literal("request.created"),
    v.literal("request.status_changed"),
  ),
  idempotencyKey: v.string(),
  loanRequestId: v.id("loanRequests"),
  status: loanRequestStatusValidator,
  toolName: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  notify: v.object({
    email: v.string(),
    name: v.string(),
    role: notifyRoleValidator,
  }),
});

const overdueRowValidator = v.object({
  loanRequestId: v.id("loanRequests"),
  borrowerEmail: v.string(),
  borrowerName: v.string(),
  toolName: v.string(),
  endDate: v.string(),
  idempotencyKey: v.string(),
});

function webhookSecret(): string | undefined {
  return env.WEBHOOK_HMAC_SECRET?.trim() || undefined;
}

function n8nRequestUrl(): string | undefined {
  return env.N8N_REQUEST_WEBHOOK_URL?.trim() || undefined;
}

function requestIdempotencyKey(
  loanRequestId: string,
  event: "request.created" | "request.status_changed",
  status: string,
): string {
  if (event === "request.created") {
    return `request:${loanRequestId}:created`;
  }
  return `request:${loanRequestId}:status:${status}`;
}

function overdueIdempotencyKey(loanRequestId: string, today: string): string {
  return `overdue:${loanRequestId}:${today}`;
}

export const buildNotifyPayload = internalQuery({
  args: {
    loanRequestId: v.id("loanRequests"),
    event: v.union(
      v.literal("request.created"),
      v.literal("request.status_changed"),
    ),
    notifyRole: notifyRoleValidator,
  },
  returns: v.union(notifyPayloadValidator, v.null()),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.loanRequestId);
    if (!request) {
      return null;
    }

    const [tool, borrower, lender] = await Promise.all([
      ctx.db.get(request.toolId),
      ctx.db.get(request.borrowerId),
      ctx.db.get(request.lenderId),
    ]);

    const recipient = args.notifyRole === "borrower" ? borrower : lender;
    if (!recipient?.email.trim()) {
      return null;
    }

    return {
      event: args.event,
      idempotencyKey: requestIdempotencyKey(
        request._id,
        args.event,
        request.status,
      ),
      loanRequestId: request._id,
      status: request.status,
      toolName: tool?.name ?? "Tool",
      startDate: request.startDate,
      endDate: request.endDate,
      notify: {
        email: recipient.email.trim(),
        name: userDisplayName(recipient),
        role: args.notifyRole,
      },
    };
  },
});

export const getAutomationByKey = internalQuery({
  args: { idempotencyKey: v.string() },
  returns: v.union(
    v.object({
      status: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("automationLogs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();
    return row ? { status: row.status } : null;
  },
});

async function patchLoanOnRequestNotificationSent(
  ctx: MutationCtx,
  args: {
    loanRequestId: Id<"loanRequests">;
    kind: string;
    status: string;
    idempotencyKey: string;
  },
) {
  if (
    args.kind !== REQUEST_KIND ||
    args.status !== "sent" ||
    !args.idempotencyKey.endsWith(":created")
  ) {
    return;
  }
  await ctx.db.patch(args.loanRequestId, {
    requestNotifiedAt: Date.now(),
  });
}

export const recordAutomation = internalMutation({
  args: {
    loanRequestId: v.id("loanRequests"),
    kind: v.string(),
    idempotencyKey: v.string(),
    status: v.string(),
    detail: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("automationLogs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();

    if (existing) {
      if (existing.status === "sent") {
        return null;
      }
      const patch: { status: string; detail?: string } = { status: args.status };
      if (args.detail !== undefined) {
        patch.detail = args.detail;
      } else if (args.status === "sent") {
        // Clear prior failure copy; omit field on insert so Dashboard doesn't show "unset".
        patch.detail = "";
      }
      await ctx.db.patch(existing._id, patch);
      await patchLoanOnRequestNotificationSent(ctx, args);
      return null;
    }

    await ctx.db.insert("automationLogs", {
      loanRequestId: args.loanRequestId,
      kind: args.kind,
      idempotencyKey: args.idempotencyKey,
      status: args.status,
      detail: args.detail,
    });
    await patchLoanOnRequestNotificationSent(ctx, args);
    return null;
  },
});

export const listOverdueLoans = internalQuery({
  args: { today: v.string() },
  returns: v.object({
    today: v.string(),
    loans: v.array(overdueRowValidator),
  }),
  handler: async (ctx, args) => {
    const candidates = await ctx.db
      .query("loanRequests")
      .withIndex("by_status_endDate", (q) => q.eq("status", "approved"))
      .filter((q) => q.lt(q.field("endDate"), args.today))
      .take(OVERDUE_LIST_CAP);

    const loans = [];
    for (const request of candidates) {
      const idempotencyKey = overdueIdempotencyKey(request._id, args.today);
      const already = await ctx.db
        .query("automationLogs")
        .withIndex("by_idempotency_key", (q) =>
          q.eq("idempotencyKey", idempotencyKey),
        )
        .unique();
      if (already?.status === "sent") {
        continue;
      }

      const [borrower, tool] = await Promise.all([
        ctx.db.get(request.borrowerId),
        ctx.db.get(request.toolId),
      ]);
      const email = borrower?.email.trim();
      if (!email) {
        continue;
      }

      loans.push({
        loanRequestId: request._id,
        borrowerEmail: email,
        borrowerName: userDisplayName(borrower),
        toolName: tool?.name ?? "Tool",
        endDate: request.endDate,
        idempotencyKey,
      });
    }

    return { today: args.today, loans };
  },
});

export const recordReminderSent = internalMutation({
  args: {
    idempotencyKey: v.string(),
    loanRequestId: v.id("loanRequests"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    detail: v.optional(v.string()),
  },
  returns: v.object({
    duplicate: v.boolean(),
    rejected: v.optional(
      v.union(
        v.literal("loan_not_found"),
        v.literal("loan_not_approved"),
        v.literal("invalid_idempotency_key"),
      ),
    ),
  }),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.loanRequestId);
    if (!request) {
      return { duplicate: false, rejected: "loan_not_found" as const };
    }
    if (request.status !== "approved") {
      return { duplicate: false, rejected: "loan_not_approved" as const };
    }

    const prefix = `overdue:${args.loanRequestId}:`;
    if (!args.idempotencyKey.startsWith(prefix)) {
      return { duplicate: false, rejected: "invalid_idempotency_key" as const };
    }

    const existing = await ctx.db
      .query("automationLogs")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();
    if (existing) {
      if (existing.status === "sent") {
        return { duplicate: true };
      }
      if (existing.status === "failed" && args.status === "sent") {
        await ctx.db.patch(existing._id, {
          status: "sent",
          detail: args.detail,
        });
        await ctx.db.patch(args.loanRequestId, {
          lastReminderSentAt: Date.now(),
        });
        return { duplicate: false };
      }
      if (existing.status === "failed" && args.status === "failed") {
        await ctx.db.patch(existing._id, {
          detail: args.detail,
        });
      }
      return { duplicate: true };
    }

    await ctx.db.insert("automationLogs", {
      loanRequestId: args.loanRequestId,
      kind: OVERDUE_KIND,
      idempotencyKey: args.idempotencyKey,
      status: args.status,
      detail: args.detail,
    });

    if (args.status === "sent") {
      await ctx.db.patch(args.loanRequestId, {
        lastReminderSentAt: Date.now(),
      });
    }

    return { duplicate: false };
  },
});

export const notifyN8n = internalAction({
  args: {
    loanRequestId: v.id("loanRequests"),
    event: v.union(
      v.literal("request.created"),
      v.literal("request.status_changed"),
    ),
    notifyRole: notifyRoleValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const payload = await ctx.runQuery(internal.automation.buildNotifyPayload, args);
    if (!payload) {
      return null;
    }

    const prior = await ctx.runQuery(internal.automation.getAutomationByKey, {
      idempotencyKey: payload.idempotencyKey,
    });
    if (prior?.status === "sent") {
      return null;
    }

    const url = n8nRequestUrl();
    if (!url) {
      await ctx.runMutation(internal.automation.recordAutomation, {
        loanRequestId: payload.loanRequestId,
        kind: REQUEST_KIND,
        idempotencyKey: payload.idempotencyKey,
        status: "skipped",
        detail: "N8N_REQUEST_WEBHOOK_URL not configured",
      });
      return null;
    }

    const secret = webhookSecret();
    if (!secret) {
      await ctx.runMutation(internal.automation.recordAutomation, {
        loanRequestId: payload.loanRequestId,
        kind: REQUEST_KIND,
        idempotencyKey: payload.idempotencyKey,
        status: "failed",
        detail: "WEBHOOK_HMAC_SECRET not configured",
      });
      return null;
    }

    const body = JSON.stringify(payload);
    const signature = await signPayload(secret, body);

    let lastError = "Unknown error";
    for (let attempt = 0; attempt < NOTIFY_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            [SIGNATURE_HEADER]: signature,
          },
          body,
        });
        if (response.ok) {
          await ctx.runMutation(internal.automation.recordAutomation, {
            loanRequestId: payload.loanRequestId,
            kind: REQUEST_KIND,
            idempotencyKey: payload.idempotencyKey,
            status: "sent",
          });
          return null;
        }
        lastError = `HTTP ${response.status}`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    await ctx.runMutation(internal.automation.recordAutomation, {
      loanRequestId: payload.loanRequestId,
      kind: REQUEST_KIND,
      idempotencyKey: payload.idempotencyKey,
      status: "failed",
      detail: lastError,
    });
    return null;
  },
});
