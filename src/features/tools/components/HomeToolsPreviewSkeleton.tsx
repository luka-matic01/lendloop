import { HomeFeatureSection } from "@/features/home/components/HomeFeatureSection";

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
      <ToolCardSkeletonGrid
        variant={variant}
        label="Loading tools on the board"
      />
    </HomeFeatureSection>
  );
}
