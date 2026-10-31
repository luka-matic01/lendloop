import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireToolAccess, requireUser } from "./lib/auth";
import { AuthErrorCode, authError } from "./lib/errors";
import { LIST_PAGE_SIZE } from "./lib/limits";
import { toolHasApprovedLoan } from "./lib/loans";
import {
  toolCategoryValidator,
  toolConditionValidator,
} from "./lib/validators";

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

/** Homepage teaser — name and category only, newest six available listings. */
export const listPublic = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("tools"),
      name: v.string(),
      category: toolCategoryValidator,
    }),
  ),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("tools")
      .withIndex("by_available_category", (q) => q.eq("isAvailable", true))
      .order("desc")
      .take(6);

    return rows.map(({ _id, name, category }) => ({ _id, name, category }));
  },
});

export const listMine = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("tools"),
      name: v.string(),
      category: toolCategoryValidator,
      condition: toolConditionValidator,
      description: v.string(),
      isAvailable: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const tools = await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .take(LIST_PAGE_SIZE);

    return tools.map(
      ({ _id, name, category, condition, description, isAvailable }) => ({
        _id,
        name,
        category,
        condition,
        description,
        isAvailable,
      }),
    );
  },
});

export const listBoard = query({
  args: {
    category: v.optional(toolCategoryValidator),
  },
  returns: v.array(
    v.object({
      _id: v.id("tools"),
      name: v.string(),
      category: toolCategoryValidator,
      condition: toolConditionValidator,
      description: v.string(),
      isAvailable: v.boolean(),
      ownerId: v.id("users"),
      ownerName: v.string(),
      ownerIsTrustedLender: v.boolean(),
      isOwner: v.boolean(),
      canRemove: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const [viewer, rows] = await Promise.all([
      requireUser(ctx),
      ctx.db
        .query("tools")
        .withIndex("by_available_category", (q) =>
          args.category
            ? q.eq("isAvailable", true).eq("category", args.category)
            : q.eq("isAvailable", true),
        )
        .order("desc")
        .take(LIST_PAGE_SIZE),
    ]);

    const uniqueOwnerIds = [...new Set(rows.map((t) => t.ownerId))];
    const owners = await Promise.all(
      uniqueOwnerIds.map((id) => ctx.db.get(id)),
    );
    const ownersById = new Map(
      uniqueOwnerIds.map((id, i) => [id, owners[i]]),
    );

    return rows.map((tool) => {
      const owner = ownersById.get(tool.ownerId);
      const isOwner = tool.ownerId === viewer._id;

      return {
        _id: tool._id,
        name: tool.name,
        category: tool.category,
        condition: tool.condition,
        description: tool.description,
        isAvailable: tool.isAvailable,
        ownerId: tool.ownerId,
        ownerName: owner?.name ?? "Neighbor",
        ownerIsTrustedLender: owner?.isTrustedLender ?? false,
        isOwner,
        canRemove: viewer.role === "admin" || isOwner,
      };
    });
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

    if (args.isAvailable && (await toolHasApprovedLoan(ctx, args.toolId))) {
      authError(
        AuthErrorCode.VALIDATION_ERROR,
        "Cannot put tool on board while it has an active loan",
      );
    }

    await ctx.db.patch(args.toolId, { isAvailable: args.isAvailable });
    return null;
  },
});
