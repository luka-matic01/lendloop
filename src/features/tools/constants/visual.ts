import { SECTION_Y_CLASS } from "@/constants";

/** Shared lucide sizing for tool-board actions */
export const TOOLS_ICON_CLASS = "size-4 shrink-0";

/** App tool board page: tighter top on small screens under masthead */
export const TOOLS_PAGE_CLASS = `space-y-8 ${SECTION_Y_CLASS} sm:space-y-10`;

export const HOME_TOOLS_SECTION_CLASS = SECTION_Y_CLASS;

export const TOOL_CARD_GRID_CLASS =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>li]:min-h-0 [&>li]:min-w-0";

export const TOOL_CARD_PANEL_CLASS =
  "relative flex h-full min-w-0 flex-col gap-2 overflow-visible !p-3 sm:gap-3 sm:!p-4";

/** Keeps long unbroken titles/descriptions inside card width (grid + flex safe). */
export const TOOL_CARD_TEXT_WRAP = "min-w-0 [overflow-wrap:anywhere]";

export const TOOL_CARD_TITLE_CLASS = `${TOOL_CARD_TEXT_WRAP} font-display text-xl font-extrabold leading-tight tracking-tight text-ink line-clamp-2 sm:text-2xl`;

export const TOOL_CARD_DESCRIPTION_CLASS = `${TOOL_CARD_TEXT_WRAP} line-clamp-3 text-sm leading-relaxed text-ink-muted`;

export const TOOL_CARD_FOOTER_TEXT_CLASS = `${TOOL_CARD_TEXT_WRAP} min-w-0 text-sm font-semibold text-ink`;

/** Default placeholder cards (e.g. home page teaser). */
export const TOOL_CARD_SKELETON_COUNT = 6;

/** “From neighbors” grid on the tool board: three rows at lg. */
export const NEIGHBOR_BOARD_SKELETON_COUNT = 9;

/** One row of placeholders under “Your listings”. */
export const TOOL_CARD_SKELETON_ROW_COUNT = 3;

/** Paused own listings: muted top stripe (live ones use category stripe + left rail). */
export const TOOL_CARD_OWN_LISTING_PAUSED_STRIPE = "border-t-line";

/** Own listing panel: pine wash + structure (browse grid + your listings). */
export const TOOL_CARD_OWN_LISTING_PANEL =
  "border-board bg-board-soft";

/** Left rail reinforces “yours” beside neighbor cards on the board. */
export const TOOL_CARD_OWN_LISTING_RAIL = "border-l-4 border-l-board";

/** Compact “Your listings” stack: pine wash, rows use `divide-y` on the list. */
export const MY_LISTINGS_PANEL_CLASS =
  "!p-0 border-board bg-board-soft overflow-visible";
