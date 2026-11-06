/** Upper bound for loan list queries, public filtered tool browse, and related aggregations. */
export const LIST_PAGE_SIZE = 100;

/** Per-tool loan rows for overlap checks; at cap we fail closed. */
export const TOOL_LOAN_ROWS_CAP = 32;

/** Default page size for the neighbor tool board (client + server). */
export const BOARD_PAGE_SIZE = 15;

/** Raw pool for homepage public teaser: client picks six with category spread. */
export const HOME_PUBLIC_POOL_SIZE = 36;

/** Default page size for the signed-in owner's listings. */
export const MY_LISTINGS_PAGE_SIZE = 50;

/** Max description length returned on board list rows (full text on edit/borrow flows). */
export const BOARD_LIST_DESCRIPTION_MAX = 160;

/** Inclusive UTC calendar days allowed on one borrow request. */
export const MAX_BORROW_CALENDAR_DAYS = 90;
