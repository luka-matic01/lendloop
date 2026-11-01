import { useMemo } from "react";

import { Button, Panel, Skeleton } from "@/components/ui";
import type { Id } from "convex/_generated/dataModel";

import { listingListRowSurfaceClass } from "@/lib/list-row-surface";

import { TOOLS_COPY } from "../constants/copy";
import {
  MY_LISTINGS_PANEL_CLASS,
  TOOL_CARD_OWN_LISTING_PANEL,
} from "../constants/visual";
import type { MyTool } from "../types/tools";
import { MyListingRow } from "./MyListingRow";
import { MyListingsSkeletonList } from "./ToolSkeletons";

/** Tools with pending requests first, then live, then out on loan, then paused. */
function listingSortRank(tool: MyTool) {
  if (tool.pendingRequestCount > 0) {
    return 0;
  }
  if (tool.isAvailable) {
    return 1;
  }
  if (tool.hasActiveLoan) {
    return 2;
  }
  return 3;
}

function sortListings(tools: MyTool[]) {
  return [...tools].sort(
    (a, b) => listingSortRank(a) - listingSortRank(b),
  );
}

type MyListingsSectionProps = {
  tools: MyTool[];
  onEdit: (tool: MyTool) => void;
  onToggleAvailability: (tool: MyTool) => void;
  onRemove: (tool: MyTool) => void;
  markReturnedPendingId?: Id<"loanRequests"> | null;
  onMarkReturned?: (requestId: Id<"loanRequests">, toolName: string) => void;
  canLoadMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
};

export function MyListingsSection({
  tools,
  onEdit,
  onToggleAvailability,
  onRemove,
  markReturnedPendingId = null,
  onMarkReturned,
  canLoadMore = false,
  loadingMore = false,
  onLoadMore,
  isLoading = false,
}: MyListingsSectionProps) {
  const sortedTools = useMemo(() => sortListings(tools), [tools]);

  const liveCount = tools.filter((tool) => tool.isAvailable).length;
  const onLoanCount = tools.filter((tool) => tool.hasActiveLoan).length;
  const pausedCount = tools.filter(
    (tool) => !tool.isAvailable && !tool.hasActiveLoan,
  ).length;
  const totalPendingRequests = tools.reduce(
    (sum, tool) => sum + tool.pendingRequestCount,
    0,
  );

  return (
    <section
      aria-labelledby="listings-heading"
      aria-busy={isLoading || undefined}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <h2
          id="listings-heading"
          className="font-display text-2xl font-bold leading-none text-ink"
        >
          {TOOLS_COPY.listingsHeading}
        </h2>
        {isLoading ? (
          <Skeleton className="h-4 w-48 max-w-full" />
        ) : tools.length > 0 ? (
          <p className="text-sm text-ink-muted">
            {TOOLS_COPY.listingsSummary(
              liveCount,
              pausedCount,
              onLoanCount,
              totalPendingRequests,
            )}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <MyListingsSkeletonList label="Loading your listings" />
      ) : tools.length === 0 ? (
        <Panel tone="default" className={TOOL_CARD_OWN_LISTING_PANEL}>
          <p className="text-sm text-ink-muted">{TOOLS_COPY.emptyListings}</p>
        </Panel>
      ) : (
        <div className="space-y-4">
          <Panel className={MY_LISTINGS_PANEL_CLASS}>
            <ul className="divide-y divide-board/25 px-3 sm:px-4">
              {sortedTools.map((tool) => (
                <li
                  key={tool._id}
                  className={listingListRowSurfaceClass({
                    pendingRequestCount: tool.pendingRequestCount,
                    isAvailable: tool.isAvailable,
                    hasActiveLoan: tool.hasActiveLoan,
                    activeLoanEndDate: tool.activeLoan?.endDate,
                  })}
                >
                  <MyListingRow
                    tool={tool}
                    onEdit={() => onEdit(tool)}
                    onToggleAvailability={() => onToggleAvailability(tool)}
                    onRemove={() => onRemove(tool)}
                    markReturnedPendingId={markReturnedPendingId}
                    onMarkReturned={onMarkReturned}
                  />
                </li>
              ))}
            </ul>
          </Panel>
          {canLoadMore && onLoadMore ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={loadingMore}
                onClick={onLoadMore}
              >
                {loadingMore
                  ? TOOLS_COPY.loadingMore
                  : TOOLS_COPY.loadMoreListings}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
