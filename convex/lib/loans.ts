import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  borrowRangesOverlap,
  isBorrowPeriodInProgress,
  isBorrowPeriodStarted,
} from "./borrowDates";
import { AuthErrorCode, authError } from "./errors";
import { LIST_PAGE_SIZE, TOOL_LOAN_ROWS_CAP } from "./limits";

type DbCtx = QueryCtx | MutationCtx;

export type ActiveBorrowStatus = "pending" | "approved";

export type LoanRequestStatus =
  | ActiveBorrowStatus
  | "declined"
  | "cancelled"
  | "returned";

export function isOpenLoanRequestStatus(
  status: LoanRequestStatus,
): status is ActiveBorrowStatus {
  return status === "pending" || status === "approved";
}

export type BookedBorrowRange = {
  startDate: string;
  endDate: string;
};

const TOOL_LOAN_ROWS_CAP_MESSAGE =
  "This tool has too many active borrows to process safely";

function assertBelowToolLoanRowsCap(rowCount: number) {
  if (rowCount >= TOOL_LOAN_ROWS_CAP) {
    authError(AuthErrorCode.VALIDATION_ERROR, TOOL_LOAN_ROWS_CAP_MESSAGE);
  }
}

export async function approvedLoansForTool(
  ctx: DbCtx,
  toolId: Id<"tools">,
): Promise<Doc<"loanRequests">[]> {
  const rows = await ctx.db
    .query("loanRequests")
    .withIndex("by_tool_and_status", (q) =>
      q.eq("toolId", toolId).eq("status", "approved"),
    )
    .take(TOOL_LOAN_ROWS_CAP);
  assertBelowToolLoanRowsCap(rows.length);
  return rows;
}

export function assertNoOverlapWithApprovedLoans(
  approved: Doc<"loanRequests">[],
  startDate: string,
  endDate: string,
) {
  const overlaps = approved.some((loan) =>
    borrowRangesOverlap(
      startDate,
      endDate,
      loan.startDate,
      loan.endDate,
    ),
  );
  if (overlaps) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      "Those dates overlap an approved borrow for this tool",
    );
  }
}

/** Any approved borrow on the tool (including overdue, not yet returned). */
export async function toolHasOpenApprovedLoan(
  ctx: DbCtx,
  toolId: Id<"tools">,
): Promise<boolean> {
  const row = await ctx.db
    .query("loanRequests")
    .withIndex("by_tool_and_status", (q) =>
      q.eq("toolId", toolId).eq("status", "approved"),
    )
    .first();
  return row !== null;
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
      .take(TOOL_LOAN_ROWS_CAP);
    assertBelowToolLoanRowsCap(rows.length);

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

export type ApprovedLoanOnTool = {
  requestId: Id<"loanRequests">;
  borrowerId: Id<"users">;
  startDate: string;
  endDate: string;
};

export function pickPrimaryApprovedLoan(
  loans: ApprovedLoanOnTool[],
  nowMs = Date.now(),
): ApprovedLoanOnTool | undefined {
  if (loans.length === 0) {
    return undefined;
  }
  const inProgress = loans.find((loan) =>
    isBorrowPeriodInProgress(loan.startDate, loan.endDate, nowMs),
  );
  if (inProgress) {
    return inProgress;
  }
  const upcoming = [...loans]
    .filter((loan) => !isBorrowPeriodStarted(loan.startDate, nowMs))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (upcoming[0]) {
    return upcoming[0];
  }
  return loans[0];
}

/** All approved loans on the lender's tools (newest request first per tool list). */
export async function approvedLoanListsByToolForLender(
  ctx: DbCtx,
  lenderId: Id<"users">,
): Promise<Map<Id<"tools">, ApprovedLoanOnTool[]>> {
  const requests = await ctx.db
    .query("loanRequests")
    .withIndex("by_lender", (q) => q.eq("lenderId", lenderId))
    .order("desc")
    .take(LIST_PAGE_SIZE);

  const byTool = new Map<Id<"tools">, ApprovedLoanOnTool[]>();
  for (const request of requests) {
    if (request.status !== "approved") {
      continue;
    }
    const list = byTool.get(request.toolId) ?? [];
    list.push({
      requestId: request._id,
      borrowerId: request.borrowerId,
      startDate: request.startDate,
      endDate: request.endDate,
    });
    byTool.set(request.toolId, list);
  }

  for (const [toolId, loans] of byTool) {
    byTool.set(
      toolId,
      [...loans].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    );
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

export async function bookedRangesByToolIds(
  ctx: DbCtx,
  toolIds: Id<"tools">[],
): Promise<Map<Id<"tools">, BookedBorrowRange[]>> {
  const byTool = new Map<Id<"tools">, BookedBorrowRange[]>();
  await Promise.all(
    toolIds.map(async (toolId) => {
      const loans = await approvedLoansForTool(ctx, toolId);
      if (loans.length === 0) {
        return;
      }
      byTool.set(
        toolId,
        loans
          .map(({ startDate, endDate }) => ({ startDate, endDate }))
          .sort((a, b) => a.startDate.localeCompare(b.startDate)),
      );
    }),
  );
  return byTool;
}

/** End date of the borrow in progress today, if any. */
export function loanOutUntilFromRanges(
  ranges: BookedBorrowRange[],
  nowMs = Date.now(),
): string | undefined {
  for (const range of ranges) {
    if (isBorrowPeriodInProgress(range.startDate, range.endDate, nowMs)) {
      return range.endDate;
    }
  }
  return undefined;
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
    .take(TOOL_LOAN_ROWS_CAP);
  assertBelowToolLoanRowsCap(pending.length);

  return pending.filter((row) => row._id !== exceptRequestId);
}
