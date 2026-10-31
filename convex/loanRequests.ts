import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { assertOwner, requireAdmin, requireUser } from "./lib/auth";
import { parseBorrowDateRange } from "./lib/borrowDates";
import { AuthErrorCode, authError } from "./lib/errors";
import { LIST_PAGE_SIZE } from "./lib/limits";
import {
  borrowerHasActiveRequestOnTool,
  isOpenLoanRequestStatus,
  listPendingRequestsForToolExcept,
} from "./lib/loans";
import { hydrateLoanRequests, loanViewValidator } from "./lib/loanViews";

export { loanViewValidator } from "./lib/loanViews";

export const listMyRequests = query({
  args: {},
  returns: v.array(loanViewValidator),
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const requests = await ctx.db
      .query("loanRequests")
      .withIndex("by_borrower", (q) => q.eq("borrowerId", user._id))
      .order("desc")
      .take(LIST_PAGE_SIZE);

    const views = await hydrateLoanRequests(ctx, requests);
    return views.filter((loan) => isOpenLoanRequestStatus(loan.status));
  },
});

export const listIncomingRequests = query({
  args: {},
  returns: v.array(loanViewValidator),
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const requests = await ctx.db
      .query("loanRequests")
      .withIndex("by_lender", (q) => q.eq("lenderId", user._id))
      .order("desc")
      .take(LIST_PAGE_SIZE);

    const views = await hydrateLoanRequests(ctx, requests);
    return views.filter((loan) => isOpenLoanRequestStatus(loan.status));
  },
});

export const listAllForAdmin = query({
  args: {},
  returns: v.array(loanViewValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const requests = await ctx.db
      .query("loanRequests")
      .order("desc")
      .take(LIST_PAGE_SIZE);

    return await hydrateLoanRequests(ctx, requests);
  },
});

export const create = mutation({
  args: {
    toolId: v.id("tools"),
    startDate: v.string(),
    endDate: v.string(),
  },
  returns: v.id("loanRequests"),
  handler: async (ctx, args) => {
    const { startDate, endDate } = parseBorrowDateRange(
      args.startDate,
      args.endDate,
    );

    const [borrower, tool] = await Promise.all([
      requireUser(ctx),
      ctx.db.get(args.toolId),
    ]);

    if (!tool) {
      authError(AuthErrorCode.NOT_FOUND, "Tool not found");
    }

    if (tool.ownerId === borrower._id) {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "You cannot request to borrow your own tool",
      );
    }

    if (!tool.isAvailable) {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "This tool is not currently available to borrow",
      );
    }

    if (
      await borrowerHasActiveRequestOnTool(ctx, tool._id, borrower._id)
    ) {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "You already have an active request for this tool",
      );
    }

    return await ctx.db.insert("loanRequests", {
      toolId: tool._id,
      borrowerId: borrower._id,
      lenderId: tool.ownerId,
      startDate,
      endDate,
      status: "pending",
    });
  },
});

export const approve = mutation({
  args: {
    requestId: v.id("loanRequests"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const [user, request] = await Promise.all([
      requireUser(ctx),
      ctx.db.get(args.requestId),
    ]);

    if (!request) {
      authError(AuthErrorCode.NOT_FOUND, "Loan request not found");
    }

    assertOwner(user, request.lenderId);

    if (request.status !== "pending") {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "Only pending requests can be approved",
      );
    }

    const tool = await ctx.db.get(request.toolId);
    if (!tool) {
      authError(AuthErrorCode.NOT_FOUND, "Tool not found");
    }

    if (!tool.isAvailable) {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "Tool is already lent out or paused",
      );
    }

    const competingPending = await listPendingRequestsForToolExcept(
      ctx,
      tool._id,
      request._id,
    );

    await Promise.all([
      ctx.db.patch(request._id, { status: "approved" }),
      ctx.db.patch(tool._id, { isAvailable: false }),
      ...competingPending.map((sibling) =>
        ctx.db.patch(sibling._id, { status: "declined" }),
      ),
    ]);

    return null;
  },
});

export const decline = mutation({
  args: {
    requestId: v.id("loanRequests"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const [user, request] = await Promise.all([
      requireUser(ctx),
      ctx.db.get(args.requestId),
    ]);

    if (!request) {
      authError(AuthErrorCode.NOT_FOUND, "Loan request not found");
    }

    assertOwner(user, request.lenderId);

    if (request.status !== "pending") {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "Only pending requests can be declined",
      );
    }

    await ctx.db.patch(request._id, { status: "declined" });
    return null;
  },
});

export const markReturned = mutation({
  args: {
    requestId: v.id("loanRequests"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const [user, request] = await Promise.all([
      requireUser(ctx),
      ctx.db.get(args.requestId),
    ]);

    if (!request) {
      authError(AuthErrorCode.NOT_FOUND, "Loan request not found");
    }

    const isParticipant =
      user._id === request.lenderId || user._id === request.borrowerId;

    if (!isParticipant) {
      authError(
        AuthErrorCode.FORBIDDEN,
        "Only the lender or borrower can mark a loan as returned",
      );
    }

    if (request.status !== "approved") {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "Only approved loans can be marked as returned",
      );
    }

    const tool = await ctx.db.get(request.toolId);

    await Promise.all([
      ctx.db.patch(request._id, { status: "returned" }),
      tool ? ctx.db.patch(tool._id, { isAvailable: true }) : Promise.resolve(),
    ]);

    return null;
  },
});
