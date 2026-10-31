import { auth } from "@clerk/nextjs/server";

import { ConvexClerkProviders } from "@/components/providers/ConvexClerkProviders";
import { fetchPublicToolListings } from "@/lib/convex-server";

import { TOOL_BOARD_COPY } from "../constants/copy";
import { HomeBoardSection } from "./HomeBoardSection";
import { HomeToolBoard } from "./HomeToolBoard";
import { ToolCardSkeletonGrid } from "./ToolBoardSkeletons";

export function PublicToolBoardFallback() {
  return (
    <HomeBoardSection
      busy
      description={TOOL_BOARD_COPY.homeBoardPublicDescription}
    >
      <ToolCardSkeletonGrid
        className="mt-6 sm:mt-8"
        variant="public"
        label="Loading tools on the board"
      />
    </HomeBoardSection>
  );
}

export async function PublicToolBoardSection() {
  const { isAuthenticated } = await auth();

  if (isAuthenticated) {
    return (
      <ConvexClerkProviders>
        <HomeToolBoard isAuthenticated />
      </ConvexClerkProviders>
    );
  }

  const tools = await fetchPublicToolListings();

  return (
    <HomeToolBoard
      isAuthenticated={false}
      publicTools={tools ?? []}
      loadFailed={tools === null}
    />
  );
}
