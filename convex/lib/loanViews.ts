import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  loanRequestStatusValidator,
  toolCategoryValidator,
} from "./validators";
import {
  neighborBoardDisplayName,
  userDisplayName,
} from "./userDisplayName";

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
  requestNotifiedAt: v.optional(v.number()),
  statusDecidedAt: v.optional(v.number()),
  lastReminderSentAt: v.optional(v.number()),
  latestAutomation: latestAutomationValidator,
});

/** Who may receive automation log fields on loan list queries. */
export type AutomationLogAudience = "member" | "admin";

export type HydrateLoanRequestOptions = {
  /**
   * `member` (borrower/lender lists): only successful `sent` rows, no `detail`.
   * `admin`: latest log including `failed` / `skipped` and optional `detail`.
   */
  automationAudience: AutomationLogAudience;
};

function mapLatestAutomation(
  latestLog: Doc<"automationLogs"> | null | undefined,
) {
  if (!latestLog) {
    return undefined;
  }

  return {
    kind: latestLog.kind,
    status: latestLog.status,
    detail: latestLog.detail,
    createdAt: latestLog._creationTime,
  };
}

export async function hydrateLoanRequests(
  ctx: QueryCtx,
  requests: Doc<"loanRequests">[],
  options: HydrateLoanRequestOptions = { automationAudience: "member" },
) {
  if (requests.length === 0) {
    return [];
  }

  const toolIds = [...new Set(requests.map((r) => r.toolId))];
  const userIds = [
    ...new Set(requests.flatMap((r) => [r.borrowerId, r.lenderId])),
  ];

  const isAdminAudience = options.automationAudience === "admin";
  const includeAutomationLogs = isAdminAudience;

  const [tools, users, latestLogs] = await Promise.all([
    Promise.all(toolIds.map((id) => ctx.db.get(id))),
    Promise.all(userIds.map((id) => ctx.db.get(id))),
    includeAutomationLogs
      ? Promise.all(
          requests.map((r) =>
            ctx.db
              .query("automationLogs")
              .withIndex("by_loan", (q) => q.eq("loanRequestId", r._id))
              .order("desc")
              .first(),
          ),
        )
      : Promise.resolve(requests.map(() => null)),
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
      borrowerName: isAdminAudience
        ? userDisplayName(borrower)
        : neighborBoardDisplayName(borrower),
      lenderId: req.lenderId,
      lenderName: isAdminAudience
        ? userDisplayName(lender)
        : neighborBoardDisplayName(lender),
      lenderIsTrusted: lender?.isTrustedLender ?? false,
      startDate: req.startDate,
      endDate: req.endDate,
      status: req.status,
      requestNotifiedAt: req.requestNotifiedAt,
      statusDecidedAt: req.statusDecidedAt,
      lastReminderSentAt: req.lastReminderSentAt,
      latestAutomation: includeAutomationLogs
        ? mapLatestAutomation(latestLog)
        : undefined,
    };
  });
}
