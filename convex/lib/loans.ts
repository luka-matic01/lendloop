import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { LIST_PAGE_SIZE } from "./limits";

type DbCtx = QueryCtx | MutationCtx;

export type ActiveBorrowStatus = "pending" | "approved";

export type LoanRequestStatus =
  | ActiveBorrowStatus
  | "declined"
  | "returned";

export function isOpenLoanRequestStatus(
  status: LoanRequestStatus,
): status is ActiveBorrowStatus {
  return status === "pending" || status === "approved";
}

/** At most one approved loan per tool in a valid board state. */
export async function toolHasApprovedLoan(
  ctx: DbCtx,
  toolId: Id<"tools">,
): Promise<boolean> {
  const approved = await ctx.db
    .query("loanRequests")
    .withIndex("by_tool_and_status", (q) =>
      q.eq("toolId", toolId).eq("status", "approved"),
    )
    .first();
  return approved !== null;
}

/** Pending or approved request from the same borrower on the same tool. */
export async function borrowerHasActiveRequestOnTool(
  ctx: DbCtx,
  toolId: Id<"tools">,
  borrowerId: Id<"users">,
): Promise<boolean> {
  for (const status of ["pending", "approved"] as const) {
    const rows = await ctx.db
      .query("loanRequests")
      .withIndex("by_tool_and_status", (q) =>
        q.eq("toolId", toolId).eq("status", status),
      )
      .take(status === "approved" ? 1 : 32);

    if (rows.some((row) => row.borrowerId === borrowerId)) {
      return true;
    }
  }
  return false;
}

/** Pending or approved borrows for the viewer, keyed by tool (one board query). */
export async function activeBorrowStatusByToolForBorrower(
  ctx: DbCtx,
  borrowerId: Id<"users">,
): Promise<Map<Id<"tools">, ActiveBorrowStatus>> {
  const requests = await ctx.db
    .query("loanRequests")
    .withIndex("by_borrower", (q) => q.eq("borrowerId", borrowerId))
    .order("desc")
    .take(LIST_PAGE_SIZE);

  const byTool = new Map<Id<"tools">, ActiveBorrowStatus>();
  for (const request of requests) {
    if (request.status !== "pending" && request.status !== "approved") {
      continue;
    }
    const existing = byTool.get(request.toolId);
    if (existing === "approved") {
      continue;
    }
    if (request.status === "approved") {
      byTool.set(request.toolId, "approved");
    } else if (!existing) {
      byTool.set(request.toolId, "pending");
    }
  }
  return byTool;
}

/** Pending incoming requests per tool for a lender (one listMine query). */
export async function pendingRequestCountByToolForLender(
  ctx: DbCtx,
  lenderId: Id<"users">,
): Promise<Map<Id<"tools">, number>> {
  const requests = await ctx.db
    .query("loanRequests")
    .withIndex("by_lender", (q) => q.eq("lenderId", lenderId))
    .order("desc")
    .take(LIST_PAGE_SIZE);

  const counts = new Map<Id<"tools">, number>();
  for (const request of requests) {
    if (request.status !== "pending") {
      continue;
    }
    counts.set(request.toolId, (counts.get(request.toolId) ?? 0) + 1);
  }
  return counts;
}

export async function listPendingRequestsForToolExcept(
  ctx: DbCtx,
  toolId: Id<"tools">,
  exceptRequestId: Id<"loanRequests">,
) {
  const pending = await ctx.db
    .query("loanRequests")
    .withIndex("by_tool_and_status", (q) =>
      q.eq("toolId", toolId).eq("status", "pending"),
    )
    .take(32);

  return pending.filter((row) => row._id !== exceptRequestId);
}
