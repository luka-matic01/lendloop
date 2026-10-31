import { Pause, Radio } from "lucide-react";

import { cn } from "@/lib/utils";

import { TOOL_CATEGORY_ACCENT } from "../constants/categoryVisual";
import { TOOL_CONDITION_VISUAL, conditionToneClass } from "../constants/conditionVisual";
import {
  TOOL_CATEGORY_LABELS,
  TOOL_CONDITION_LABELS,
  type ToolCategoryKey,
  type ToolConditionKey,
} from "../constants/labels";
import { TOOL_BOARD_ICON_CLASS } from "../constants/visual";
import { ToolCategoryIcon } from "./ToolCategoryIcon";

export type ToolListingState = "on_board" | "paused";

type ToolCardCategoryBadgeProps = {
  category: ToolCategoryKey;
  iconWellClassName?: string;
  /** List rows — icon well only; label stays for screen readers */
  iconOnly?: boolean;
  className?: string;
};

export function ToolCardCategoryBadge({
  category,
  iconWellClassName,
  iconOnly = false,
  className,
}: ToolCardCategoryBadgeProps) {
  const iconWell =
    iconWellClassName ?? TOOL_CATEGORY_ACCENT[category].iconWell;
  const label = TOOL_CATEGORY_LABELS[category];

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-control",
          iconWell,
        )}
      >
        <ToolCategoryIcon category={category} />
      </span>
      {iconOnly ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="text-xs font-semibold leading-none text-ink-muted">
          {label}
        </span>
      )}
    </div>
  );
}

type ToolListingStateBadgeProps = {
  state: ToolListingState;
  /** List rows — icon only; label stays for screen readers */
  iconOnly?: boolean;
};

export function ToolListingStateBadge({
  state,
  iconOnly = false,
}: ToolListingStateBadgeProps) {
  if (state === "on_board") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center leading-none text-positive",
          !iconOnly && "gap-1 text-xs font-semibold",
        )}
      >
        <Radio className={cn(TOOL_BOARD_ICON_CLASS, "size-3.5")} aria-hidden />
        {iconOnly ? (
          <span className="sr-only">On board</span>
        ) : (
          "On board"
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center leading-none text-ink-muted",
        !iconOnly && "gap-1 text-xs font-semibold",
      )}
    >
      <Pause className={cn(TOOL_BOARD_ICON_CLASS, "size-3.5")} aria-hidden />
      {iconOnly ? <span className="sr-only">Paused</span> : "Paused"}
    </span>
  );
}

type ToolCardConditionMarkProps = {
  condition: ToolConditionKey;
  /** List rows — icon well only; label stays for screen readers */
  iconOnly?: boolean;
  className?: string;
};

/** Pairs with category badge — icon well + label, anchored on the meta row. */
export function ToolCardConditionMark({
  condition,
  iconOnly = false,
  className,
}: ToolCardConditionMarkProps) {
  const { Icon } = TOOL_CONDITION_VISUAL[condition];
  const label = TOOL_CONDITION_LABELS[condition];

  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-control border-2",
          conditionToneClass[condition],
        )}
      >
        <Icon className="size-3.5 shrink-0" aria-hidden />
      </span>
      {iconOnly ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="text-xs font-semibold leading-none text-ink">
          {label}
        </span>
      )}
    </div>
  );
}

type ToolCardStateRowProps = {
  condition: ToolConditionKey;
  /** Only in “Your listings” — Paused / On board on the right */
  listingState?: ToolListingState;
  className?: string;
};

export function ToolCardStateRow({
  condition,
  listingState,
  className,
}: ToolCardStateRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        listingState ? "justify-between" : "justify-start",
        className,
      )}
    >
      <ToolCardConditionMark condition={condition} />
      {listingState ? (
        <ToolListingStateBadge state={listingState} />
      ) : null}
    </div>
  );
}
