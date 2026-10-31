import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    INITIAL_ADMIN_EMAIL: v.optional(v.string()),
  },
});

export default app;
