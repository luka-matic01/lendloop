/** Max listings on the home page board teaser */
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
    reservedCount = 0,
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
    const reserved =
      reservedCount === 1
        ? "1 reserved"
        : reservedCount === 0
          ? ""
          : `${reservedCount} reserved`;

    const parts = [requests, live, paused, onLoan, reserved].filter(Boolean);
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
  listingReserved: "Reserved",
  listingReservationsCta(count: number) {
    return count === 1 ? "1 reservation" : `${count} reservations`;
  },
  listingReservationsLinkAria(count: number, toolName: string) {
    const noun = count === 1 ? "reservation" : "reservations";
    return `View ${count} approved ${noun} for ${toolName} on Loans`;
  },
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
  boardOutUntil(endDateLabel: string) {
    return `Out until ${endDateLabel}`;
  },
  pendingBorrowRequest: "Pending request",
  activeBorrowOnLoan: "On loan",
  removeListing: "Remove",
  editListing: "Edit",
  editListingTitle(toolName: string) {
    return `Edit ${toolName}`;
  },
  listingActionsLabel: "Listing actions",
  moderationActionsLabel: "Board moderation",
  listingsHeading: "Your listings",
  listTool: "List a tool",
  loadErrorTitle: "Could not open tool board",
  emptyBoard: "Nothing listed yet.",
  emptyCategory: "No tools in this category.",
  emptyListings: "No listings yet.",
  addToBoard: "Add to board",
  adding: "Adding…",
  modalTitle: "List a tool",
  saveListing: "Save changes",
  saveListingAction: "Save",
  savingListing: "Saving…",
  addToBoardAction: "Add",
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
  confirmRemoveTitle(toolName: string) {
    return `Remove ${toolName}?`;
  },
  confirmRemoveDescription:
    "This permanently deletes the listing. You can add the tool again later if you want.",
  confirmRemoveNeighborDescription(ownerName: string) {
    return `This permanently removes ${ownerName}’s listing from the board.`;
  },
  cancel: "Cancel",
  seeFullBoard: "See the full board",
  loadMoreBoard: "Load more on the board",
  loadMoreListings: "Load more listings",
  loadingMore: "Loading…",
} as const;
