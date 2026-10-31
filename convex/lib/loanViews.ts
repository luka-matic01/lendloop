import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  loanRequestStatusValidator,
  toolCategoryValidator,
} from "./validators";
import { userDisplayName } from "./userDisplayName";

const latestAutomationValidator = v.optional(
  v.object({
    kind: v.string(),
    status: v.string(),
    detail: v.optional(v.string()),
    createdAt: v.number(),
  }),
);

export const loanViewValidator = v.object({
  _id: v.id("loanRequests"),
  _creationTime: v.number(),
  toolId: v.id("tools"),
  toolName: v.string(),
  toolCategory: toolCategoryValidator,
  borrowerId: v.id("users"),
  borrowerName: v.string(),
  lenderId: v.id("users"),
  lenderName: v.string(),
  lenderIsTrusted: v.boolean(),
  startDate: v.string(),
  endDate: v.string(),
  status: loanRequestStatusValidator,
  lastReminderSentAt: v.optional(v.number()),
  latestAutomation: latestAutomationValidator,
});

export async function hydrateLoanRequests(
  ctx: QueryCtx,
  requests: Doc<"loanRequests">[],
) {
  if (requests.length === 0) {
    return [];
  }

  const toolIds = [...new Set(requests.map((r) => r.toolId))];
  const userIds = [
    ...new Set(requests.flatMap((r) => [r.borrowerId, r.lenderId])),
  ];

  const [tools, users, latestLogs] = await Promise.all([
    Promise.all(toolIds.map((id) => ctx.db.get(id))),
    Promise.all(userIds.map((id) => ctx.db.get(id))),
    Promise.all(
      requests.map((r) =>
        ctx.db
          .query("automationLogs")
          .withIndex("by_loan", (q) => q.eq("loanRequestId", r._id))
          .order("desc")
          .first(),
      ),
    ),
  ]);

  const toolsById = new Map<Id<"tools">, Doc<"tools"> | null>(
    toolIds.map((id, i) => [id, tools[i] ?? null]),
  );
  const usersById = new Map<Id<"users">, Doc<"users"> | null>(
    userIds.map((id, i) => [id, users[i] ?? null]),
  );

  return requests.map((req, index) => {
    const tool = toolsById.get(req.toolId);
    const borrower = usersById.get(req.borrowerId);
    const lender = usersById.get(req.lenderId);
    const latestLog = latestLogs[index];

    return {
      _id: req._id,
      _creationTime: req._creationTime,
      toolId: req.toolId,
      toolName: tool?.name ?? "Removed tool",
      toolCategory: tool?.category ?? "other",
      borrowerId: req.borrowerId,
      borrowerName: userDisplayName(borrower),
      lenderId: req.lenderId,
      lenderName: userDisplayName(lender),
      lenderIsTrusted: lender?.isTrustedLender ?? false,
      startDate: req.startDate,
      endDate: req.endDate,
      status: req.status,
      lastReminderSentAt: req.lastReminderSentAt,
      latestAutomation: latestLog
        ? {
            kind: latestLog.kind,
            status: latestLog.status,
            detail: latestLog.detail,
            createdAt: latestLog._creationTime,
          }
        : undefined,
    };
  });
}
