import { Container, Skeleton } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import {
  NEIGHBOR_BOARD_SKELETON_COUNT,
  TOOLS_PAGE_CLASS,
} from "../constants/visual";
import {
  MyListingsSkeletonList,
  ToolCardSkeletonGrid,
} from "./ToolSkeletons";
import { ToolsPageIntro } from "./ToolsPageIntro";

/** Route-level stand-in that matches the tool board while the page segment loads. */
export function ToolsPageSkeleton() {
  return (
    <Container className={TOOLS_PAGE_CLASS} aria-busy="true">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
          <ToolsPageIntro />
        </div>
        <Skeleton className="h-9 w-[7.5rem] shrink-0 sm:h-10 sm:w-28" />
      </header>
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
        <div className="flex flex-wrap gap-2" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-20 rounded-sm" />
          ))}
        </div>
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
