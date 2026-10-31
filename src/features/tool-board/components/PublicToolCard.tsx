import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { PublicToolListing } from "@/lib/convex-server";

import { TOOL_CATEGORY_ACCENT } from "../constants/categoryVisual";
import {
  TOOL_CARD_PANEL_CLASS,
  TOOL_CARD_TITLE_CLASS,
} from "../constants/visual";
import { ToolCardCategoryBadge } from "./ToolCardMeta";

type PublicToolCardProps = {
  tool: PublicToolListing;
  className?: string;
};

/** Homepage teaser — name and category only (matches `listPublic` scope). */
export function PublicToolCard({ tool, className }: PublicToolCardProps) {
  const accent = TOOL_CATEGORY_ACCENT[tool.category];

  return (
    <Panel
      className={cn(
        TOOL_CARD_PANEL_CLASS,
        "border-t-4",
        accent.stripe,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <h3 className={cn(TOOL_CARD_TITLE_CLASS, "flex-1")}>{tool.name}</h3>
        <ToolCardCategoryBadge
          category={tool.category}
          iconWellClassName={accent.iconWell}
        />
      </div>
    </Panel>
  );
}
