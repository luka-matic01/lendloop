import { HomeFeatureSection } from "@/features/home/components/HomeFeatureSection";
import { Skeleton } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import {
  ToolCardSkeletonGrid,
  type ToolCardSkeletonVariant,
} from "./ToolSkeletons";

type HomeToolsPreviewSkeletonProps = {
  variant?: ToolCardSkeletonVariant;
};

/** Home board section shell + card grid placeholder (safe for RSC / Suspense fallbacks). */
export function HomeToolsPreviewSkeleton({
  variant = "public",
}: HomeToolsPreviewSkeletonProps) {
  return (
    <HomeFeatureSection
      headingId="public-board-heading"
      title={TOOLS_COPY.homeBoardTitle}
      busy
    >
      {variant === "public" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-20 rounded-sm" />
              ))}
            </div>
            <Skeleton className="h-11 w-full shrink-0 rounded-control lg:w-80" />
          </div>
          <ToolCardSkeletonGrid
            variant={variant}
            label="Loading tools on the board"
          />
        </div>
      ) : (
        <ToolCardSkeletonGrid
          variant={variant}
          label="Loading tools on the board"
        />
      )}
    </HomeFeatureSection>
  );
}
