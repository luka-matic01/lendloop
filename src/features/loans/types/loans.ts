import type { FunctionReturnType } from "convex/server";

import { api } from "convex/_generated/api";

export type LoanView = FunctionReturnType<
  typeof api.loanRequests.listMyRequests
>[number];
