/** Max listings on the marketing homepage board teaser */
export const HOME_BOARD_PREVIEW_LIMIT = 6;

export const TOOLS_COPY = {
  homeBoardTitle: "On the board",
  homeBoardPublicDescription:
    "Names and categories only — sign in to see condition, lender, and borrow details.",
  homeBoardSignedInDescription: "Latest gear neighbors are sharing.",
  pageTitle: "Tool board",
  pageDescription:
    "Browse the board first, then manage what you list below.",
  browseSectionLabel: "From neighbors",
  emptyNeighborsBoard:
    "Nothing from neighbors yet. You can still list your gear below.",
  emptyNeighborsCategory: "No neighbors in this category.",
  listingsSummary(liveCount: number, pausedCount: number) {
    if (liveCount === 0) {
      return pausedCount === 1 ? "1 paused" : `${pausedCount} paused`;
    }
    if (pausedCount === 0) {
      return liveCount === 1 ? "1 live on the board" : `${liveCount} live on the board`;
    }
    const live =
      liveCount === 1 ? "1 live" : `${liveCount} live`;
    const paused =
      pausedCount === 1 ? "1 paused" : `${pausedCount} paused`;
    return `${live} · ${paused}`;
  },
  pauseListing: "Pause",
  putOnBoard: "Put on board",
  borrowTool: "Borrow",
  removeListing: "Remove",
  editListing: "Edit",
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
    return `“${toolName}” is on the board`;
  },
  toastListingUpdated(toolName: string) {
    return `“${toolName}” saved`;
  },
  toastListingRemoved(toolName: string) {
    return `“${toolName}” removed`;
  },
  toastListingPaused(toolName: string) {
    return `“${toolName}” paused`;
  },
  toastListingOnBoard(toolName: string) {
    return `“${toolName}” is on the board`;
  },
  confirmPauseTitle(toolName: string) {
    return `Pause “${toolName}”?`;
  },
  confirmPauseDescription:
    "Neighbors won't see it on the board until you put it back.",
  confirmPutOnBoardTitle(toolName: string) {
    return `Put “${toolName}” on the board?`;
  },
  confirmPutOnBoardDescription:
    "Neighbors will see the name, category, and condition on the board.",
  confirmPauseAction(toolName: string) {
    return `Pause “${toolName}”`;
  },
  confirmPutOnBoardAction(toolName: string) {
    return `Put “${toolName}” on board`;
  },
  confirmRemoveTitle(toolName: string) {
    return `Remove “${toolName}”?`;
  },
  confirmRemoveDescription:
    "This permanently deletes the listing. You can add the tool again later if you want.",
  confirmRemoveAction(toolName: string) {
    return `Remove “${toolName}”`;
  },
  cancel: "Cancel",
  seeFullBoard: "See the full board",
} as const;
