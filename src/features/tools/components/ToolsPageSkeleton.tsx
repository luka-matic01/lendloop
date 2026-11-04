"use client";

import { Container, Skeleton } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import {
  NEIGHBOR_BOARD_SKELETON_COUNT,
  TOOLS_PAGE_CLASS,
} from "../constants/visual";
import { CategoryFilterBar } from "./CategoryFilterBar";
import {
  MyListingsSkeletonList,
  ToolCardSkeletonGrid,
} from "./ToolSkeletons";
import { ToolsPageHeader } from "./ToolsPageHeader";

/** Route-level stand-in that matches the tool board while the page segment loads. */
export function ToolsPageSkeleton() {
  return (
    <Container className={TOOLS_PAGE_CLASS} aria-busy="true">
      <ToolsPageHeader onListTool={() => {}} listDisabled />
      <section
        aria-labelledby="browse-neighbors-heading-skeleton"
        className="space-y-4"
      >
        <h2
          id="browse-neighbors-heading-skeleton"
          className="font-display text-2xl font-bold leading-none text-ink"
        >
          {TOOLS_COPY.browseSectionLabel}
        </h2>
        <CategoryFilterBar value="all" onChange={() => {}} />
        <ToolCardSkeletonGrid
          count={NEIGHBOR_BOARD_SKELETON_COUNT}
          label="Loading tools on the board"
        />
      </section>
      <section
        aria-labelledby="listings-heading-skeleton"
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <h2
            id="listings-heading-skeleton"
            className="font-display text-2xl font-bold leading-none text-ink"
          >
            {TOOLS_COPY.listingsHeading}
          </h2>
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
        <MyListingsSkeletonList label="Loading your listings" />
      </section>
    </Container>
  );
}
