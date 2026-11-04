import { auth } from "@clerk/nextjs/server";

import { Suspense } from "react";

import { HomeToolsPreview, HomeToolsPreviewSkeleton } from "@/features/tools";

import { HomeSignedInDashboard } from "./HomeSignedInDashboard";
import { fetchPublicToolListings } from "@/lib/convexServer";

async function HomePublicBoardPreview() {
  const tools = await fetchPublicToolListings();
  const loadFailed = tools === null;

  return (
    <HomeToolsPreview
      isAuthenticated={false}
      publicTools={tools ?? []}
      loadFailed={loadFailed}
    />
  );
}

/** One Convex + Clerk tree for signed-in homepage sections (tools + loans). */
export async function HomeDashboardGate() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<HomeToolsPreviewSkeleton />}>
        <HomePublicBoardPreview />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={<HomeToolsPreviewSkeleton variant="board" />}
    >
      <HomeSignedInDashboard />
    </Suspense>
  );
}
