import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { PublicToolListing } from "@/lib/convex-server";

import { TOOL_CATEGORY_ACCENT } from "../constants/categoryVisual";
import { TOOL_CATEGORY_LABELS } from "../constants/labels";
import {
  TOOL_CARD_PANEL_CLASS,
  TOOL_CARD_TITLE_CLASS,
} from "../constants/visual";

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
      <h3 className={TOOL_CARD_TITLE_CLASS}>{tool.name}</h3>
      <p className="text-xs font-semibold text-ink-muted">
        {TOOL_CATEGORY_LABELS[tool.category]}
      </p>
    </Panel>
  );
}
