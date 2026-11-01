import { BOARD_PAGE_SIZE, MY_LISTINGS_PAGE_SIZE } from "../convex/lib/limits";

export function firstBoardPage(numItems = BOARD_PAGE_SIZE) {
  return { paginationOpts: { numItems, cursor: null } } as const;
}

export function firstMyListingsPage(numItems = MY_LISTINGS_PAGE_SIZE) {
  return { paginationOpts: { numItems, cursor: null } } as const;
}
