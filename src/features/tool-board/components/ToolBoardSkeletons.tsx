import type { CSSProperties } from "react";

import { Panel, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

import {
  MY_LISTINGS_PANEL_CLASS,
  TOOL_CARD_GRID_CLASS,
  TOOL_CARD_PANEL_CLASS,
  TOOL_CARD_SKELETON_COUNT,
  TOOL_CARD_SKELETON_ROW_COUNT,
} from "../constants/visual";

const TITLE_WIDTHS = ["w-3/5", "w-2/3", "w-1/2", "w-[70%]", "w-2/5", "w-[62%]"] as const;
const BODY_WIDTHS = ["w-4/5", "w-11/12", "w-3/4", "w-full", "w-2/3", "w-5/6"] as const;

type SkeletonDelayStyle = CSSProperties & {
  "--skeleton-delay"?: string;
};

function skeletonDelay(index: number): SkeletonDelayStyle {
  return { "--skeleton-delay": `${index * 90}ms` };
}

type ToolCardSkeletonVariant = "public" | "board";

type ToolCardSkeletonProps = {
  index?: number;
  variant?: ToolCardSkeletonVariant;
};

export function ToolCardSkeleton({
  index = 0,
  variant = "board",
}: ToolCardSkeletonProps) {
  const titleWidth = TITLE_WIDTHS[index % TITLE_WIDTHS.length];
  const bodyWidth = BODY_WIDTHS[index % BODY_WIDTHS.length];

  return (
    <Panel
      className={cn(TOOL_CARD_PANEL_CLASS, "border-t-4 border-t-line")}
      style={skeletonDelay(index)}
    >
      {variant === "public" ? (
        <>
          <span className="inline-flex items-center gap-1.5">
            <Skeleton className="size-7" />
            <Skeleton className="h-3 w-16" />
          </span>
          <Skeleton className={cn("h-6 sm:h-7", titleWidth)} />
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <Skeleton className={cn("h-6 sm:h-7", titleWidth)} />
            <span className="inline-flex shrink-0 items-center gap-1.5">
              <Skeleton className="size-7" />
              <Skeleton className="h-3 w-14" />
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-5 w-16" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className={cn("h-3.5", bodyWidth)} />
          </div>

          <div className="mt-auto border-t border-line pt-3">
            <Skeleton className="h-4 w-32" />
          </div>
        </>
      )}
    </Panel>
  );
}

type ToolCardSkeletonGridProps = {
  count?: number;
  className?: string;
  label?: string;
  variant?: ToolCardSkeletonVariant;
};

export function ToolCardSkeletonGrid({
  count = TOOL_CARD_SKELETON_COUNT,
  className,
  label = "Loading tools",
  variant = "board",
}: ToolCardSkeletonGridProps) {
  return (
    <div className={className} aria-busy="true">
      <p className="sr-only">{label}</p>
      <ul aria-hidden="true" className={TOOL_CARD_GRID_CLASS}>
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="min-h-0">
            <ToolCardSkeleton index={index} variant={variant} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type MyListingsSkeletonListProps = {
  count?: number;
  label?: string;
};

export function MyListingsSkeletonList({
  count = TOOL_CARD_SKELETON_ROW_COUNT,
  label = "Loading your listings",
}: MyListingsSkeletonListProps) {
  return (
    <Panel className={MY_LISTINGS_PANEL_CLASS} aria-busy="true">
      <p className="sr-only">{label}</p>
      <ul aria-hidden="true" className="divide-y divide-board/25">
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className="flex items-start gap-3 px-3 py-3 sm:items-center sm:px-4 sm:py-3.5"
            style={skeletonDelay(index)}
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-2/5 sm:h-6" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
            <Skeleton className="h-8 w-[6.75rem] shrink-0" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
