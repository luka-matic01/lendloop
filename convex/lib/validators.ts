import { v } from "convex/values";

export const toolCategories = [
  "power_tools",
  "garden",
  "kitchen",
  "camping",
  "other",
] as const;

export const toolConditions = ["excellent", "good", "fair", "needs_care"] as const;

export const userRoles = ["admin", "user"] as const;

export const loanRequestStatuses = [
  "pending",
  "approved",
  "declined",
  "cancelled",
  "returned",
] as const;

export const toolCategoryValidator = v.union(
  ...toolCategories.map((c) => v.literal(c))
);

export const toolConditionValidator = v.union(
  ...toolConditions.map((c) => v.literal(c))
);

export const userRoleValidator = v.union(...userRoles.map((r) => v.literal(r)));

export const loanRequestStatusValidator = v.union(
  ...loanRequestStatuses.map((s) => v.literal(s))
);
