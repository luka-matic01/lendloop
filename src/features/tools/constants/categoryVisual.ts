import type { ToolCategoryKey } from "./labels";

/** Per-category card chrome: top stripe + icon well (see globals.css tokens). */
export const TOOL_CATEGORY_ACCENT: Record<
  ToolCategoryKey,
  { stripe: string; iconWell: string }
> = {
  power_tools: {
    stripe: "border-t-cat-power",
    iconWell: "bg-cat-power-soft text-cat-power",
  },
  garden: {
    stripe: "border-t-cat-garden",
    iconWell: "bg-cat-garden-soft text-cat-garden",
  },
  kitchen: {
    stripe: "border-t-cat-kitchen",
    iconWell: "bg-cat-kitchen-soft text-cat-kitchen",
  },
  camping: {
    stripe: "border-t-cat-camping",
    iconWell: "bg-cat-camping-soft text-cat-camping",
  },
  other: {
    stripe: "border-t-cat-other",
    iconWell: "bg-cat-other-soft text-cat-other",
  },
};
