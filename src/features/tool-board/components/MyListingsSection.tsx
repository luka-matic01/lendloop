import { useMemo } from "react";

import { Panel, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

import { TOOL_BOARD_COPY } from "../constants/copy";
import {
  MY_LISTINGS_PANEL_CLASS,
  TOOL_CARD_OWN_LISTING_PANEL,
} from "../constants/visual";
import type { MyTool } from "../types/tools";
import { MyListingRow } from "./MyListingRow";
import { MyListingsSkeletonList } from "./ToolBoardSkeletons";

/** Live listings first; relative order unchanged within each group. */
function sortListings(tools: MyTool[]) {
  return [...tools].sort((a, b) => {
    if (a.isAvailable === b.isAvailable) {
      return 0;
    }
    return a.isAvailable ? -1 : 1;
  });
}

type MyListingsSectionProps = {
  tools: MyTool[];
  onEdit: (tool: MyTool) => void;
  onToggleAvailability: (tool: MyTool) => void;
  onRemove: (tool: MyTool) => void;
  isLoading?: boolean;
};

export function MyListingsSection({
  tools,
  onEdit,
  onToggleAvailability,
  onRemove,
  isLoading = false,
}: MyListingsSectionProps) {
  const sortedTools = useMemo(() => sortListings(tools), [tools]);

  return (
    <section
      aria-labelledby="listings-heading"
      aria-busy={isLoading || undefined}
      className="space-y-4"
    >
      <h2
        id="listings-heading"
        className="font-display text-2xl font-bold leading-none text-ink"
      >
        {TOOL_BOARD_COPY.listingsHeading}
        {isLoading ? (
          <Skeleton className="ml-2 inline-block h-5 w-8 align-middle" />
        ) : (
          <span className="ml-2 text-lg font-semibold text-ink-muted">
            ({tools.length})
          </span>
        )}
      </h2>

      {isLoading ? (
        <MyListingsSkeletonList label="Loading your listings" />
      ) : tools.length === 0 ? (
        <Panel tone="default" className={TOOL_CARD_OWN_LISTING_PANEL}>
          <p className="text-sm text-ink-muted">{TOOL_BOARD_COPY.emptyListings}</p>
        </Panel>
      ) : (
        <Panel className={MY_LISTINGS_PANEL_CLASS}>
          <ul className="divide-y divide-board/25 px-3 sm:px-4">
            {sortedTools.map((tool) => (
              <li
                key={tool._id}
                className={cn(
                  !tool.isAvailable &&
                    "bg-canvas/70 -mx-3 px-3 sm:-mx-4 sm:px-4",
                )}
              >
                <MyListingRow
                  tool={tool}
                  onEdit={() => onEdit(tool)}
                  onToggleAvailability={() => onToggleAvailability(tool)}
                  onRemove={() => onRemove(tool)}
                />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </section>
  );
}
