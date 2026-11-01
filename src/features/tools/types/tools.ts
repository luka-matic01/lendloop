import type { FunctionReturnType } from "convex/server";

import { api } from "convex/_generated/api";

export type BoardTool =
  FunctionReturnType<typeof api.tools.listBoard>["page"][number];
export type MyTool =
  FunctionReturnType<typeof api.tools.listMine>["page"][number];
