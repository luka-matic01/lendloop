import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = QueryCtx | MutationCtx;

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
