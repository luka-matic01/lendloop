import type { ReactNode } from "react";

import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

import { TOOL_CATEGORY_ACCENT } from "../constants/categoryVisual";
import { conditionMetaTextClass } from "../constants/conditionVisual";
import {
  TOOL_CATEGORY_LABELS,
  TOOL_CONDITION_LABELS,
  type ToolCategoryKey,
  type ToolConditionKey,
} from "../constants/labels";
import {
  TOOL_CARD_DESCRIPTION_CLASS,
  TOOL_CARD_OWN_LISTING_PANEL,
  TOOL_CARD_OWN_LISTING_PAUSED_STRIPE,
  TOOL_CARD_OWN_LISTING_RAIL,
  TOOL_CARD_PANEL_CLASS,
  TOOL_CARD_TITLE_CLASS,
} from "../constants/visual";
import type { ToolListingState } from "../types/listingState";
import { ToolListingStateBadge } from "./ToolListingStateBadge";

type ToolCardLayoutProps = {
  category: ToolCategoryKey;
  condition: ToolConditionKey;
  name: string;
  description: string | null;
  listingState?: ToolListingState;
  isOwnListing?: boolean;
  headerActions?: ReactNode;
  footer?: ReactNode;
  notice?: ReactNode;
  panelClassName?: string;
};

export function ToolCardLayout({
  category,
  condition,
  name,
  description,
  listingState,
  isOwnListing = false,
  headerActions,
  footer,
  notice,
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
      <div className="min-w-0">
        {isOwnListing ? (
          <p className="mb-1 text-xs font-semibold leading-none text-board">
            Yours
          </p>
        ) : null}
        <div
          className={cn(
            headerActions && "flex items-start justify-between gap-2",
          )}
        >
          <h3
            className={cn(
              TOOL_CARD_TITLE_CLASS,
              headerActions && "min-w-0 flex-1",
            )}
          >
            {name}
          </h3>
          {headerActions ? (
            <div className="flex shrink-0 items-center">{headerActions}</div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "flex min-w-0 items-center gap-3",
          listingState ? "justify-between" : "justify-start",
        )}
      >
        <p className="min-w-0 text-xs font-semibold text-ink-muted">
          {TOOL_CATEGORY_LABELS[category]}
          <span aria-hidden> · </span>
          <span className={conditionMetaTextClass[condition]}>
            {TOOL_CONDITION_LABELS[condition]}
          </span>
        </p>
        {listingState ? (
          <ToolListingStateBadge state={listingState} />
        ) : null}
      </div>

      {description ? (
        <p className={TOOL_CARD_DESCRIPTION_CLASS}>{description}</p>
      ) : null}

      {notice ? <div className="min-w-0">{notice}</div> : null}

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
