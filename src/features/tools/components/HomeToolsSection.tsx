import { TOOLS_COPY } from "../constants/copy";
import { HomeToolsFrame } from "./HomeToolsFrame";
import { ToolCardSkeletonGrid } from "./ToolSkeletons";

export function HomeToolsSectionSkeleton() {
  return (
    <HomeToolsFrame
      busy
      description={TOOLS_COPY.homeBoardPublicDescription}
    >
      <ToolCardSkeletonGrid
        variant="public"
        label="Loading tools on the board"
      />
    </HomeToolsFrame>
  );
}
