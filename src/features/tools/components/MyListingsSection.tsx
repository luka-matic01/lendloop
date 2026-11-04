"use client";

import { useCallback, useMemo } from "react";
import { usePaginatedQuery } from "convex/react";

import { Button, Panel } from "@/components/ui";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { listingListRowSurfaceClass } from "@/lib/listRowSurface";

import { TOOLS_COPY } from "../constants/copy";
import { MY_LISTINGS_PAGE_SIZE } from "../constants/pagination";
import {
  MY_LISTINGS_PANEL_CLASS,
  TOOL_CARD_OWN_LISTING_PANEL,
} from "../constants/visual";
import type { useListingActions } from "../hooks/useListingActions";
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
  isReady: boolean;
  listingActions: ReturnType<typeof useListingActions>;
  markReturnedPendingId?: Id<"loanRequests"> | null;
  onMarkReturned?: (requestId: Id<"loanRequests">, toolName: string) => void;
};

export function MyListingsSection({
  isReady,
  listingActions,
  markReturnedPendingId = null,
  onMarkReturned,
}: MyListingsSectionProps) {
  const { openEditModal, requestToggleListingAvailability, requestRemoveListing } =
    listingActions;

  const {
    results: tools,
    status: myListingsStatus,
    loadMore: loadMoreMyListings,
  } = usePaginatedQuery(
    api.tools.listMine,
    isReady ? {} : "skip",
    { initialNumItems: MY_LISTINGS_PAGE_SIZE },
  );

  const isLoading =
    !isReady || myListingsStatus === "LoadingFirstPage";
  const canLoadMore = myListingsStatus === "CanLoadMore";
  const loadingMore = myListingsStatus === "LoadingMore";
  const onLoadMore = useCallback(() => {
    loadMoreMyListings(MY_LISTINGS_PAGE_SIZE);
  }, [loadMoreMyListings]);

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
        {TOOLS_COPY.listingsHeading}
      </h2>

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
                    activeLoanStarted: tool.activeLoan?.started,
                    activeLoanEndDate: tool.activeLoan?.endDate,
                  })}
                >
                  <MyListingRow
                    tool={tool}
                    onEdit={() => openEditModal(tool)}
                    onToggleAvailability={() =>
                      requestToggleListingAvailability(tool)
                    }
                    onRemove={() => requestRemoveListing(tool)}
                    markReturnedPendingId={markReturnedPendingId}
                    onMarkReturned={onMarkReturned}
                  />
                </li>
              ))}
            </ul>
          </Panel>
          {canLoadMore ? (
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
