import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { assertOwner, requireUser } from "./lib/auth";
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
    throw new Error("Tool name is required");
  }
  if (name.length > TOOL_NAME_MAX_LENGTH) {
    throw new Error(
      `Tool name must be at most ${TOOL_NAME_MAX_LENGTH} characters`,
    );
  }
  if (description.length > TOOL_DESCRIPTION_MAX_LENGTH) {
    throw new Error(
      `Notes must be at most ${TOOL_DESCRIPTION_MAX_LENGTH} characters`,
    );
  }

  return { name, description };
}

/** Homepage teaser — name and category only, newest six available listings. */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("tools")
      .withIndex("by_available_category", (q) => q.eq("isAvailable", true))
      .order("desc")
      .take(6);

    return rows.map((tool) => ({
      _id: tool._id,
      name: tool.name,
      category: tool.category,
    }));
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const tools = await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .take(100);

    return tools.map((tool) => ({
      _id: tool._id,
      name: tool.name,
      category: tool.category,
      condition: tool.condition,
      description: tool.description,
      isAvailable: tool.isAvailable,
    }));
  },
});

export const listBoard = query({
  args: {
    category: v.optional(toolCategoryValidator),
  },
  handler: async (ctx, args) => {
    const viewer = await requireUser(ctx);

    const rows = await ctx.db
      .query("tools")
      .withIndex("by_available_category", (q) =>
        args.category
          ? q.eq("isAvailable", true).eq("category", args.category)
          : q.eq("isAvailable", true),
      )
      .order("desc")
      .take(100);

    const ownersById = new Map<
      string,
      { name: string; isTrustedLender: boolean }
    >();

    for (const tool of rows) {
      const key = String(tool.ownerId);
      if (!ownersById.has(key)) {
        const owner = await ctx.db.get(tool.ownerId);
        ownersById.set(key, {
          name: owner?.name ?? "Neighbor",
          isTrustedLender: owner?.isTrustedLender ?? false,
        });
      }
    }

    return rows.map((tool) => {
      const owner = ownersById.get(String(tool.ownerId)) ?? {
        name: "Neighbor",
        isTrustedLender: false,
      };

      return {
        _id: tool._id,
        name: tool.name,
        category: tool.category,
        condition: tool.condition,
        description: tool.description,
        isAvailable: tool.isAvailable,
        ownerId: tool.ownerId,
        ownerName: owner.name,
        ownerIsTrustedLender: owner.isTrustedLender,
        isOwner: tool.ownerId === viewer._id,
        canRemove: viewer.role === "admin" || tool.ownerId === viewer._id,
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
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool) {
      throw new Error("Tool not found");
    }

    if (user.role !== "admin") {
      assertOwner(user, tool.ownerId);
    }

    const { name, description } = normalizeToolFields(args);

    await ctx.db.patch(args.toolId, {
      name,
      category: args.category,
      condition: args.condition,
      description,
    });
  },
});

export const remove = mutation({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool) {
      throw new Error("Tool not found");
    }

    if (user.role !== "admin") {
      assertOwner(user, tool.ownerId);
    }

    await ctx.db.delete(args.toolId);
  },
});

export const setAvailability = mutation({
  args: {
    toolId: v.id("tools"),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool) {
      throw new Error("Tool not found");
    }

    if (user.role !== "admin") {
      assertOwner(user, tool.ownerId);
    }

    await ctx.db.patch(args.toolId, { isAvailable: args.isAvailable });
  },
});
