"use client";

import { useMemo } from "react";

import { Panel } from "@/components/ui";
import { useStalePaginatedQuery } from "@/hooks/useStalePaginatedQuery";
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
import { sortMyListings } from "../utils/sortMyListings";
import { ToolListingRow } from "./ToolListingRow";
import { ToolsSection } from "./ToolsSection";
import { MyListingsSkeletonList } from "./ToolSkeletons";

const MY_LISTINGS_TAB_KEY = "my-listings";

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
    displayItems: tools,
    status: myListingsStatus,
    isInitialLoad,
    isRefreshing: myListingsRefreshing,
    loadMore,
    loadingMore,
  } = useStalePaginatedQuery<MyTool>(
    api.tools.listMine,
    isReady ? {} : "skip",
    MY_LISTINGS_TAB_KEY,
    MY_LISTINGS_PAGE_SIZE,
  );

  const isLoading =
    tools.length === 0 && (!isReady || isInitialLoad);
  const canLoadMore = myListingsStatus === "CanLoadMore";
  const sortedTools = useMemo(() => sortMyListings(tools), [tools]);

  return (
    <ToolsSection
      headingId="listings-heading"
      heading={TOOLS_COPY.listingsHeading}
      busy={isLoading || myListingsRefreshing}
      isLoading={isLoading}
      loading={
        <MyListingsSkeletonList label="Loading your listings" />
      }
      isEmpty={tools.length === 0}
      empty={
        <Panel tone="default" className={TOOL_CARD_OWN_LISTING_PANEL}>
          <p className="text-sm text-ink-muted">{TOOLS_COPY.emptyListings}</p>
        </Panel>
      }
      loadMore={{
        canLoadMore,
        loadingMore,
        onLoadMore: loadMore,
        label: TOOLS_COPY.loadMoreListings,
        loadingLabel: TOOLS_COPY.loadingMore,
        className: "flex justify-center",
      }}
    >
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
              <ToolListingRow
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
    </ToolsSection>
  );
}
