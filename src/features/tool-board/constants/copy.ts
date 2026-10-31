/** Max listings on the marketing homepage board teaser */
export const HOME_BOARD_PREVIEW_LIMIT = 5;

export const TOOL_BOARD_COPY = {
  homeBoardTitle: "On the board",
  homeBoardPublicDescription:
    "Names and categories only — sign in to see condition, lender, and borrow details.",
  homeBoardSignedInDescription: "Latest gear neighbors are sharing.",
  pageTitle: "Tool board",
  pageDescription:
    "Browse what neighbors are sharing, then manage your own listings below.",
  browseSectionLabel: "From neighbors",
  emptyNeighborsBoard:
    "No neighbors are sharing on the board yet. Yours can still go live below.",
  emptyNeighborsCategory: "No neighbors in this category.",
  manageOwnOnBoard(count: number) {
    if (count === 1) {
      return "You have 1 tool on the board — manage it below.";
    }
    return `You have ${count} on the board — manage them below.`;
  },
  pauseListing: "Pause",
  putOnBoard: "Put on board",
  removeListing: "Remove",
  listingsHeading: "Your listings",
  listTool: "List a tool",
  loadErrorTitle: "Could not open tool board",
  emptyBoard: "Nothing listed yet.",
  emptyCategory: "No tools in this category.",
  emptyListings: "You have not listed anything yet.",
  addToBoard: "Add to board",
  adding: "Adding…",
  modalTitle: "List a tool",
} as const;
