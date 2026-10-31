import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  loanRequestStatusValidator,
  toolCategoryValidator,
  toolConditionValidator,
  userRoleValidator,
} from "./lib/validators";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    role: userRoleValidator,
    isTrustedLender: v.boolean(),
  }).index("by_token", ["tokenIdentifier"]),

  tools: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    category: toolCategoryValidator,
    condition: toolConditionValidator,
    description: v.string(),
    isAvailable: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_available_category", ["isAvailable", "category"]),

  loanRequests: defineTable({
    toolId: v.id("tools"),
    borrowerId: v.id("users"),
    lenderId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    status: loanRequestStatusValidator,
    lastReminderSentAt: v.optional(v.number()),
  })
    .index("by_borrower", ["borrowerId"])
    .index("by_lender", ["lenderId"])
    .index("by_tool", ["toolId"])
    .index("by_tool_and_status", ["toolId", "status"])
    .index("by_status_endDate", ["status", "endDate"]),

  automationLogs: defineTable({
    loanRequestId: v.id("loanRequests"),
    kind: v.string(),
    idempotencyKey: v.string(),
    status: v.string(),
    detail: v.optional(v.string()),
  })
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_loan", ["loanRequestId"]),
});
