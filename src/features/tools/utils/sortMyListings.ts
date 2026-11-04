import type { MyTool } from "../types/tools";

/** Pending requests first, then live, then out on loan, then paused. */
function listingSortRank(tool: MyTool) {
  if (tool.pendingRequestCount > 0) {
    return 0;
  }
  if (tool.isAvailable) {
    return 1;
  }
  if (tool.hasActiveLoan) {
    return 2;
  }
  return 3;
}

export function sortMyListings(tools: MyTool[]) {
  return [...tools].sort(
    (a, b) => listingSortRank(a) - listingSortRank(b),
  );
}
