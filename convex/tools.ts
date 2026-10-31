import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { assertOwner, requireUser } from "./lib/auth";
import {
  toolCategoryValidator,
  toolConditionValidator,
} from "./lib/validators";

export const listPublic = query({
  args: {
    category: v.optional(toolCategoryValidator),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("tools")
      .withIndex("by_available_category", (q) =>
        args.category
          ? q.eq("isAvailable", true).eq("category", args.category)
          : q.eq("isAvailable", true),
      )
      .collect();

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
      .collect();

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

export const create = mutation({
  args: {
    name: v.string(),
    category: toolCategoryValidator,
    condition: toolConditionValidator,
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const name = args.name.trim();
    const description = args.description.trim();

    if (!name) {
      throw new Error("Tool name is required");
    }

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
