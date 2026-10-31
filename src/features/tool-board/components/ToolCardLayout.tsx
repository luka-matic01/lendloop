import type { ReactNode } from "react";

import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

import { TOOL_CATEGORY_ACCENT } from "../constants/categoryVisual";
import type { ToolCategoryKey, ToolConditionKey } from "../constants/labels";
import {
  TOOL_CARD_DESCRIPTION_CLASS,
  TOOL_CARD_OWN_LISTING_PANEL,
  TOOL_CARD_OWN_LISTING_PAUSED_STRIPE,
  TOOL_CARD_OWN_LISTING_RAIL,
  TOOL_CARD_PANEL_CLASS,
  TOOL_CARD_TITLE_CLASS,
} from "../constants/visual";
import {
  ToolCardCategoryBadge,
  ToolCardStateRow,
  type ToolListingState,
} from "./ToolCardMeta";

type ToolCardLayoutProps = {
  category: ToolCategoryKey;
  condition: ToolConditionKey;
  name: string;
  description: string | null;
  listingState?: ToolListingState;
  isOwnListing?: boolean;
  footer?: ReactNode;
  panelClassName?: string;
};

export function ToolCardLayout({
  category,
  condition,
  name,
  description,
  listingState,
  isOwnListing = false,
  footer,
  panelClassName,
}: ToolCardLayoutProps) {
  const accent = TOOL_CATEGORY_ACCENT[category];
  const isPausedOwn = isOwnListing && listingState === "paused";
  const topStripe = isPausedOwn
    ? TOOL_CARD_OWN_LISTING_PAUSED_STRIPE
    : accent.stripe;

  return (
    <Panel
      className={cn(
        TOOL_CARD_PANEL_CLASS,
        "border-t-4",
        topStripe,
        isOwnListing && TOOL_CARD_OWN_LISTING_PANEL,
        isOwnListing && TOOL_CARD_OWN_LISTING_RAIL,
        panelClassName,
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          {isOwnListing ? (
            <p className="mb-1 text-xs font-semibold leading-none text-board">
              Yours
            </p>
          ) : null}
          <h3 className={TOOL_CARD_TITLE_CLASS}>{name}</h3>
        </div>
        <ToolCardCategoryBadge
          category={category}
          iconWellClassName={accent.iconWell}
        />
      </div>

      <ToolCardStateRow condition={condition} listingState={listingState} />

      {description ? (
        <p className={TOOL_CARD_DESCRIPTION_CLASS}>{description}</p>
      ) : null}

      {footer ? (
        <div
          className={cn(
            "mt-auto border-t pt-3",
            isOwnListing ? "border-board/25" : "border-line",
          )}
        >
          {footer}
        </div>
      ) : null}
    </Panel>
  );
}
