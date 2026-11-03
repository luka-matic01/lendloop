import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { assertOwner, requireAdmin, requireUser } from "./lib/auth";
import {
  borrowRangesOverlap,
  isBorrowPeriodStarted,
  parseBorrowDateRange,
} from "./lib/borrowDates";
import { AuthErrorCode, authError } from "./lib/errors";
import { LIST_PAGE_SIZE } from "./lib/limits";
import {
  approvedLoansForTool,
  assertNoOverlapWithApprovedLoans,
  borrowerHasActiveRequestOnTool,
  listPendingRequestsForToolExcept,
} from "./lib/loans";
import { sortLoanViewsByLastActivity } from "./lib/loanLastActivity";
import { hydrateLoanRequests, loanViewValidator } from "./lib/loanViews";
import {
  scheduleLoanNotification,
  scheduleNotifyOtherParty,
} from "./lib/scheduleLoanNotification";

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

    const rows = await hydrateLoanRequests(ctx, requests, {
      automationAudience: "member",
    });
    return sortLoanViewsByLastActivity(rows, "borrower");
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

    const rows = await hydrateLoanRequests(ctx, requests, {
      automationAudience: "member",
    });
    return sortLoanViewsByLastActivity(rows, "lender");
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

    const rows = await hydrateLoanRequests(ctx, requests, {
      automationAudience: "admin",
    });
    return sortLoanViewsByLastActivity(rows, "admin");
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

    const approved = await approvedLoansForTool(ctx, tool._id);
    assertNoOverlapWithApprovedLoans(approved, startDate, endDate);

    if (
      await borrowerHasActiveRequestOnTool(ctx, tool._id, borrower._id)
    ) {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "You already have an active request for this tool",
      );
    }

    const requestId = await ctx.db.insert("loanRequests", {
      toolId: tool._id,
      borrowerId: borrower._id,
      lenderId: tool.ownerId,
      startDate,
      endDate,
      status: "pending",
    });

    scheduleLoanNotification(ctx, {
      loanRequestId: requestId,
      event: "request.created",
      notifyRole: "lender",
    });

    return requestId;
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

    const approved = await approvedLoansForTool(ctx, tool._id);
    assertNoOverlapWithApprovedLoans(
      approved,
      request.startDate,
      request.endDate,
    );

    const competingPending = await listPendingRequestsForToolExcept(
      ctx,
      tool._id,
      request._id,
    );
    const overlappingPending = competingPending.filter((sibling) =>
      borrowRangesOverlap(
        request.startDate,
        request.endDate,
        sibling.startDate,
        sibling.endDate,
      ),
    );

    const decidedAt = Date.now();
    await Promise.all([
      ctx.db.patch(request._id, {
        status: "approved",
        statusDecidedAt: decidedAt,
      }),
      ...overlappingPending.map((sibling) =>
        ctx.db.patch(sibling._id, {
          status: "declined",
          statusDecidedAt: decidedAt,
        }),
      ),
    ]);

    scheduleLoanNotification(ctx, {
      loanRequestId: request._id,
      event: "request.status_changed",
      notifyRole: "borrower",
    });
    for (const sibling of overlappingPending) {
      scheduleLoanNotification(ctx, {
        loanRequestId: sibling._id,
        event: "request.status_changed",
        notifyRole: "borrower",
      });
    }

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

    await ctx.db.patch(request._id, {
      status: "declined",
      statusDecidedAt: Date.now(),
    });

    scheduleLoanNotification(ctx, {
      loanRequestId: request._id,
      event: "request.status_changed",
      notifyRole: "borrower",
    });

    return null;
  },
});

export const cancelPending = mutation({
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

    assertOwner(user, request.borrowerId);

    if (request.status !== "pending") {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "Only pending requests can be cancelled",
      );
    }

    await ctx.db.patch(request._id, {
      status: "cancelled",
      statusDecidedAt: Date.now(),
    });

    scheduleLoanNotification(ctx, {
      loanRequestId: request._id,
      event: "request.status_changed",
      notifyRole: "lender",
    });

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

    if (!isBorrowPeriodStarted(request.startDate)) {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "The borrow period has not started yet — cancel the reservation instead",
      );
    }

    await ctx.db.patch(request._id, {
      status: "returned",
      statusDecidedAt: Date.now(),
    });

    scheduleNotifyOtherParty(ctx, {
      loanRequestId: request._id,
      actorUserId: user._id,
      lenderId: request.lenderId,
      borrowerId: request.borrowerId,
    });

    return null;
  },
});

export const cancelApproved = mutation({
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
        "Only the lender or borrower can cancel this reservation",
      );
    }

    if (request.status !== "approved") {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "Only approved reservations can be cancelled",
      );
    }

    if (isBorrowPeriodStarted(request.startDate)) {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "The borrow period has started — mark the tool returned instead",
      );
    }

    await ctx.db.patch(request._id, {
      status: "cancelled",
      statusDecidedAt: Date.now(),
    });

    scheduleNotifyOtherParty(ctx, {
      loanRequestId: request._id,
      actorUserId: user._id,
      lenderId: request.lenderId,
      borrowerId: request.borrowerId,
    });

    return null;
  },
});
