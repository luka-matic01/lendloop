/** Max listings on the marketing homepage board teaser */
export const HOME_BOARD_PREVIEW_LIMIT = 6;

export const TOOLS_COPY = {
  homeBoardTitle: "On the board",
  homeBoardPublicDescription:
    "Sign in to see condition, lender, and borrow details.",
  homeBoardSignedInDescription: "Latest gear neighbors are sharing.",
  pageTitle: "Tool board",
  pageDescription:
    "Browse the board first, then manage what you list below.",
  browseSectionLabel: "From neighbors",
  emptyNeighborsBoard:
    "Nothing from neighbors yet. You can still list your gear below.",
  emptyNeighborsCategory: "No neighbors in this category.",
  listingsSummary(
    liveCount: number,
    pausedCount: number,
    onLoanCount = 0,
    pendingRequestCount = 0,
  ) {
    const requests =
      pendingRequestCount === 1
        ? "1 borrow request waiting"
        : pendingRequestCount === 0
          ? ""
          : `${pendingRequestCount} borrow requests waiting`;
    const live =
      liveCount === 1 ? "1 live" : liveCount === 0 ? "" : `${liveCount} live`;
    const paused =
      pausedCount === 1 ? "1 paused" : pausedCount === 0 ? "" : `${pausedCount} paused`;
    const onLoan =
      onLoanCount === 1
        ? "1 out on loan"
        : onLoanCount === 0
          ? ""
          : `${onLoanCount} out on loan`;

    const parts = [requests, live, paused, onLoan].filter(Boolean);
    if (parts.length === 0) {
      return "";
    }
    if (
      pendingRequestCount === 0 &&
      liveCount > 0 &&
      pausedCount === 0 &&
      onLoanCount === 0
    ) {
      return liveCount === 1 ? "1 live on the board" : `${liveCount} live on the board`;
    }
    if (
      pendingRequestCount === 0 &&
      liveCount === 0 &&
      pausedCount > 0 &&
      onLoanCount === 0
    ) {
      return pausedCount === 1 ? "1 paused" : `${pausedCount} paused`;
    }
    return parts.join(" · ");
  },
  listingOutOnLoan: "Out on loan",
  listingRequestsNotice(count: number) {
    return count === 1
      ? "1 neighbor wants to borrow this · Needs your OK"
      : `${count} neighbors want to borrow this · Needs your OK`;
  },
  listingRequestsCta(count: number) {
    return count === 1 ? "Review request" : `Review ${count} requests`;
  },
  listingRequestsLinkAria(count: number, toolName: string) {
    const noun = count === 1 ? "request" : "requests";
    return `Review ${count} loan ${noun} for ${toolName} on Loans`;
  },
  listingLockedActiveLoan:
    "This listing is locked while the tool is out on an approved loan. Mark it returned first.",
  putOnBoardBlockedActiveLoan:
    "Cannot put on board while this tool is out on an approved loan. Mark it returned first.",
  pauseListing: "Pause",
  putOnBoard: "Put on board",
  borrowTool: "Borrow",
  pendingBorrowRequest: "Pending request",
  activeBorrowOnLoan: "On loan",
  removeListing: "Remove",
  editListing: "Edit",
  editListingTitle(toolName: string) {
    return `Edit ${toolName}`;
  },
  listingActionsLabel: "Listing actions",
  listingsHeading: "Your listings",
  listTool: "List a tool",
  loadErrorTitle: "Could not open tool board",
  emptyBoard: "Nothing listed yet.",
  emptyCategory: "No tools in this category.",
  emptyListings: "You have not listed anything yet.",
  addToBoard: "Add to board",
  adding: "Adding…",
  modalTitle: "List a tool",
  saveListing: "Save changes",
  savingListing: "Saving…",
  toastListingCreated(toolName: string) {
    return `${toolName} is on the board`;
  },
  toastListingUpdated(toolName: string) {
    return `${toolName} saved`;
  },
  toastListingRemoved(toolName: string) {
    return `${toolName} removed`;
  },
  toastListingPaused(toolName: string) {
    return `${toolName} paused`;
  },
  toastListingOnBoard(toolName: string) {
    return `${toolName} is on the board`;
  },
  confirmPauseTitle(toolName: string) {
    return `Pause ${toolName}?`;
  },
  confirmPauseDescription:
    "Neighbors won't see it on the board until you put it back.",
  confirmPutOnBoardTitle(toolName: string) {
    return `Put ${toolName} on the board?`;
  },
  confirmPutOnBoardDescription:
    "Neighbors will see the name, category, and condition on the board.",
  confirmPauseAction(toolName: string) {
    return `Pause ${toolName}`;
  },
  confirmPutOnBoardAction(toolName: string) {
    return `Put ${toolName} on board`;
  },
  confirmRemoveTitle(toolName: string) {
    return `Remove ${toolName}?`;
  },
  confirmRemoveDescription:
    "This permanently deletes the listing. You can add the tool again later if you want.",
  confirmRemoveAction(toolName: string) {
    return `Remove ${toolName}`;
  },
  cancel: "Cancel",
  seeFullBoard: "See the full board",
} as const;
