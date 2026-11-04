import {
  isBorrowPeriodStarted,
} from "@/lib/formatBorrowDue";

import type { ToolListingState } from "../types/listingState";
import type { MyTool } from "../types/tools";

type ListingStateInput = Pick<
  MyTool,
  "isAvailable" | "activeLoan" | "hasActiveLoan"
>;

/** Single source for Paused / On board / Out on loan / Reserved. */
export function getToolListingState(tool: ListingStateInput): ToolListingState {
  const activeLoan = tool.activeLoan;
  const loanInProgress = activeLoan?.started === true;
  const loanUpcoming =
    activeLoan !== undefined &&
    !loanInProgress &&
    !isBorrowPeriodStarted(activeLoan.startDate);

  if (loanUpcoming) {
    return "reserved";
  }
  if (tool.isAvailable) {
    return "on_board";
  }
  if (loanInProgress) {
    return "on_loan";
  }
  return "paused";
}
