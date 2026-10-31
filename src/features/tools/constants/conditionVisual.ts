import {
  CircleCheck,
  CircleMinus,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { ToolConditionKey } from "./labels";

export const conditionToneClass: Record<ToolConditionKey, string> = {
  excellent: "border-line bg-surface text-ink",
  good: "border-line bg-canvas text-ink",
  fair: "border-line bg-surface text-ink-muted",
  needs_care: "border-warning bg-warning-soft text-warning",
};

/** Meta row on board cards — text only, no loud wells. */
export const conditionMetaTextClass: Record<ToolConditionKey, string> = {
  excellent: "text-ink",
  good: "text-ink-muted",
  fair: "text-ink-muted",
  needs_care: "text-warning",
};

export const TOOL_CONDITION_VISUAL: Record<
  ToolConditionKey,
  { Icon: LucideIcon; shortLabel: string }
> = {
  excellent: { Icon: Sparkles, shortLabel: "Excellent" },
  good: { Icon: CircleCheck, shortLabel: "Good" },
  fair: { Icon: CircleMinus, shortLabel: "Fair" },
  needs_care: { Icon: Wrench, shortLabel: "Needs care" },
};
