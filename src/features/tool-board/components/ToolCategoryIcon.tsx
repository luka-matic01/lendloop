import {
  ChefHat,
  Drill,
  Package,
  Shovel,
  Tent,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { ToolCategoryKey } from "../constants/labels";
import { TOOL_BOARD_ICON_CLASS } from "../constants/visual";

const TOOL_CATEGORY_ICONS: Record<ToolCategoryKey, LucideIcon> = {
  power_tools: Drill,
  garden: Shovel,
  kitchen: ChefHat,
  camping: Tent,
  other: Package,
};

type ToolCategoryIconProps = {
  category: ToolCategoryKey;
  className?: string;
};

export function ToolCategoryIcon({ category, className }: ToolCategoryIconProps) {
  const Icon = TOOL_CATEGORY_ICONS[category];

  return (
    <Icon
      className={cn(TOOL_BOARD_ICON_CLASS, className)}
      aria-hidden
    />
  );
}
