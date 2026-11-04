import type { CSSProperties } from "react";

import { ListRowSkeleton, Panel, Skeleton } from "@/components/ui";
import { listRowSurfaceClass } from "@/lib/listRowSurface";
import { cn } from "@/lib/utils";

import {
  MY_LISTINGS_PANEL_CLASS,
  TOOL_CARD_GRID_CLASS,
  TOOL_CARD_PANEL_CLASS,
  TOOL_CARD_SKELETON_COUNT,
  TOOL_CARD_SKELETON_ROW_COUNT,
} from "../constants/visual";

const TITLE_WIDTHS = ["w-3/5", "w-2/3", "w-1/2", "w-[70%]", "w-2/5", "w-[62%]"] as const;
const META_WIDTHS = ["w-[58%]", "w-1/2", "w-[62%]", "w-[48%]", "w-[55%]", "w-[52%]"] as const;
const BODY_WIDTHS = ["w-4/5", "w-11/12", "w-3/4", "w-full", "w-2/3", "w-5/6"] as const;

const TOOL_CARD_TITLE_SKELETON = "h-7 max-w-full sm:h-8";

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

function PublicToolCardSkeleton({ index }: { index: number }) {
  const titleWidth = TITLE_WIDTHS[index % TITLE_WIDTHS.length];

  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <Skeleton className={cn(TOOL_CARD_TITLE_SKELETON, titleWidth)} />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function BoardToolCardSkeleton({ index }: { index: number }) {
  const titleWidth = TITLE_WIDTHS[index % TITLE_WIDTHS.length];
  const metaWidth = META_WIDTHS[index % META_WIDTHS.length];
  const bodyWidth = BODY_WIDTHS[index % BODY_WIDTHS.length];

  return (
    <>
      <div className="min-w-0">
        <Skeleton className={cn(TOOL_CARD_TITLE_SKELETON, titleWidth)} />
      </div>

      <Skeleton className={cn("h-3.5", metaWidth)} />

      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className={cn("h-3.5", bodyWidth)} />
      </div>

      <div className="mt-auto border-t border-line pt-3">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <Skeleton className="h-4 w-28 max-w-[55%]" />
          <Skeleton className="h-8 w-[5.25rem] shrink-0" />
        </div>
      </div>
    </>
  );
}

export function ToolCardSkeleton({
  index = 0,
  variant = "board",
}: ToolCardSkeletonProps) {
  return (
    <Panel
      className={cn(TOOL_CARD_PANEL_CLASS, "border-t-4 border-t-line")}
      style={skeletonDelay(index)}
    >
      {variant === "public" ? (
        <PublicToolCardSkeleton index={index} />
      ) : (
        <BoardToolCardSkeleton index={index} />
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
      <ul aria-hidden="true" className="divide-y divide-board/25 px-3 sm:px-4">
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className={listRowSurfaceClass("default")}
            style={skeletonDelay(index)}
          >
            <ListRowSkeleton
              iconActions
              actionCount={1}
              actionsPlacement="bodyEnd"
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
