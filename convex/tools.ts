import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireToolAccess, requireUser } from "./lib/auth";
import { AuthErrorCode, authError } from "./lib/errors";
import {
  BOARD_LIST_DESCRIPTION_MAX,
  HOME_PUBLIC_POOL_SIZE,
} from "./lib/limits";
import {
  isBorrowPeriodInProgress,
  isUpcomingBorrowReservation,
} from "./lib/borrowDates";
import {
  activeBorrowStatusByToolForBorrower,
  approvedLoanListsByToolForLender,
  pickPrimaryApprovedLoan,
  bookedRangesByToolIds,
  loanOutUntilFromRanges,
  pendingRequestCountByToolForLender,
  toolHasOpenApprovedLoan,
} from "./lib/loans";
import {
  toolCategoryValidator,
  toolConditionValidator,
} from "./lib/validators";
import {
  neighborBoardDisplayName,
  userDisplayName,
} from "./lib/userDisplayName";

const TOOL_NAME_MAX_LENGTH = 80;
const TOOL_DESCRIPTION_MAX_LENGTH = 280;

function normalizeToolFields(args: { name: string; description: string }) {
  const name = args.name.trim();
  const description = args.description.trim();

  if (!name) {
    authError(AuthErrorCode.VALIDATION_ERROR, "Tool name is required");
  }
  if (name.length > TOOL_NAME_MAX_LENGTH) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      `Tool name must be at most ${TOOL_NAME_MAX_LENGTH} characters`,
    );
  }
  if (description.length > TOOL_DESCRIPTION_MAX_LENGTH) {
    authError(
      AuthErrorCode.VALIDATION_ERROR,
      `Notes must be at most ${TOOL_DESCRIPTION_MAX_LENGTH} characters`,
    );
  }

  return { name, description };
}

function boardListDescription(description: string): string {
  const trimmed = description.trim();
  if (trimmed.length <= BOARD_LIST_DESCRIPTION_MAX) {
    return trimmed;
  }
  return `${trimmed.slice(0, BOARD_LIST_DESCRIPTION_MAX - 1)}…`;
}

const boardToolRowValidator = v.object({
  _id: v.id("tools"),
  name: v.string(),
  category: toolCategoryValidator,
  condition: toolConditionValidator,
  description: v.string(),
  ownerId: v.id("users"),
  ownerName: v.string(),
  ownerIsTrustedLender: v.boolean(),
  isOwner: v.boolean(),
  canRemove: v.boolean(),
  viewerBorrowStatus: v.optional(
    v.union(v.literal("pending"), v.literal("approved")),
  ),
  loanOutUntil: v.optional(v.string()),
  bookedRanges: v.array(
    v.object({
      startDate: v.string(),
      endDate: v.string(),
    }),
  ),
});

const myToolRowValidator = v.object({
  _id: v.id("tools"),
  name: v.string(),
  category: toolCategoryValidator,
  condition: toolConditionValidator,
  description: v.string(),
  isAvailable: v.boolean(),
  hasActiveLoan: v.boolean(),
  pendingRequestCount: v.number(),
  activeLoan: v.optional(
    v.object({
      requestId: v.id("loanRequests"),
      borrowerName: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      started: v.boolean(),
    }),
  ),
  upcomingReservationCount: v.number(),
});

async function hydrateBoardPage(
  ctx: QueryCtx,
  viewer: Doc<"users">,
  tools: Doc<"tools">[],
) {
  const [activeBorrowsByTool, bookedByTool] = await Promise.all([
    activeBorrowStatusByToolForBorrower(ctx, viewer._id),
    bookedRangesByToolIds(
      ctx,
      tools.map((tool) => tool._id),
    ),
  ]);

  const uniqueOwnerIds = [...new Set(tools.map((t) => t.ownerId))];
  const owners = await Promise.all(
    uniqueOwnerIds.map((id) => ctx.db.get(id)),
  );
  const ownersById = new Map(
    uniqueOwnerIds.map((id, i) => [id, owners[i]]),
  );

  return tools.map((tool) => {
    const owner = ownersById.get(tool.ownerId);
    const isOwner = tool.ownerId === viewer._id;
    const bookedRanges = bookedByTool.get(tool._id) ?? [];

    return {
      _id: tool._id,
      name: tool.name,
      category: tool.category,
      condition: tool.condition,
      description: boardListDescription(tool.description),
      ownerId: tool.ownerId,
      ownerName:
        viewer.role === "admin"
          ? userDisplayName(owner)
          : neighborBoardDisplayName(owner),
      ownerIsTrustedLender: owner?.isTrustedLender ?? false,
      isOwner,
      canRemove: viewer.role === "admin" || isOwner,
      viewerBorrowStatus: activeBorrowsByTool.get(tool._id),
      loanOutUntil: loanOutUntilFromRanges(bookedRanges),
      bookedRanges,
    };
  });
}

const OPEN_LOAN_LISTING_MESSAGE =
  "Cannot modify listing while an approved borrow is still open";

async function rejectIfToolListingLockedForEdit(
  ctx: MutationCtx,
  toolId: Id<"tools">,
) {
  if (await toolHasOpenApprovedLoan(ctx, toolId)) {
    authError(AuthErrorCode.VALIDATION_ERROR, OPEN_LOAN_LISTING_MESSAGE);
  }
}

/** Homepage teaser pool: name and category only; client picks six with spread. */
export const listPublic = query({
  args: {},
  returns: v.array(
    v.object({
      name: v.string(),
      category: toolCategoryValidator,
    }),
  ),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("tools")
      .withIndex("by_available_category", (q) => q.eq("isAvailable", true))
      .order("desc")
      .take(HOME_PUBLIC_POOL_SIZE);

    return rows.map(({ name, category }) => ({ name, category }));
  },
});

export const listMine = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(myToolRowValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const pageResult = await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const [pendingByTool, approvedListsByTool] = await Promise.all([
      pendingRequestCountByToolForLender(ctx, user._id),
      approvedLoanListsByToolForLender(ctx, user._id),
    ]);

    const borrowerIds = [
      ...new Set(
        [...approvedListsByTool.values()]
          .flat()
          .map((loan) => loan.borrowerId),
      ),
    ];
    const borrowers = await Promise.all(
      borrowerIds.map((id) => ctx.db.get(id)),
    );
    const borrowerNameById = new Map(
      borrowerIds.map((id, index) => [
        id,
        neighborBoardDisplayName(borrowers[index] ?? null),
      ]),
    );

    const page = pageResult.page.map(
      ({ _id, name, category, condition, description, isAvailable }) => {
        const approvedLoans = approvedListsByTool.get(_id) ?? [];
        const approved = pickPrimaryApprovedLoan(approvedLoans);

        return {
          _id,
          name,
          category,
          condition,
          description,
          isAvailable,
          hasActiveLoan: approved !== undefined,
          pendingRequestCount: pendingByTool.get(_id) ?? 0,
          activeLoan: approved
            ? {
                requestId: approved.requestId,
                borrowerName:
                  borrowerNameById.get(approved.borrowerId) ?? "Neighbor",
                startDate: approved.startDate,
                endDate: approved.endDate,
                started: isBorrowPeriodInProgress(
                  approved.startDate,
                  approved.endDate,
                ),
              }
            : undefined,
          upcomingReservationCount: approvedLoans.filter((loan) =>
            isUpcomingBorrowReservation(loan.startDate),
          ).length,
        };
      },
    );

    return { ...pageResult, page };
  },
});

export const listBoard = query({
  args: {
    category: v.optional(toolCategoryValidator),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(boardToolRowValidator),
  handler: async (ctx, args) => {
    const viewer = await requireUser(ctx);

    const pageResult = await ctx.db
      .query("tools")
      .withIndex("by_available_category", (q) =>
        args.category
          ? q.eq("isAvailable", true).eq("category", args.category)
          : q.eq("isAvailable", true),
      )
      .filter((q) => q.neq(q.field("ownerId"), viewer._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await hydrateBoardPage(ctx, viewer, pageResult.page);

    return { ...pageResult, page };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: toolCategoryValidator,
    condition: toolConditionValidator,
    description: v.string(),
  },
  returns: v.id("tools"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { name, description } = normalizeToolFields(args);

    return await ctx.db.insert("tools", {
      ownerId: user._id,
      name,
      category: args.category,
      condition: args.condition,
      description,
      isAvailable: true,
    });
  },
});

export const update = mutation({
  args: {
    toolId: v.id("tools"),
    name: v.string(),
    category: toolCategoryValidator,
    condition: toolConditionValidator,
    description: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireToolAccess(ctx, args.toolId);
    await rejectIfToolListingLockedForEdit(ctx, args.toolId);
    const { name, description } = normalizeToolFields(args);

    await ctx.db.patch(args.toolId, {
      name,
      category: args.category,
      condition: args.condition,
      description,
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    toolId: v.id("tools"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireToolAccess(ctx, args.toolId);
    await rejectIfToolListingLockedForEdit(ctx, args.toolId);
    await ctx.db.delete(args.toolId);
    return null;
  },
});

export const setAvailability = mutation({
  args: {
    toolId: v.id("tools"),
    isAvailable: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireToolAccess(ctx, args.toolId);

    await ctx.db.patch(args.toolId, { isAvailable: args.isAvailable });
    return null;
  },
});
