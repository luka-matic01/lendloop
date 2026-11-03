import { auth } from "@clerk/nextjs/server";

import { ConvexClerkProviders } from "@/components/providers/ConvexClerkProviders";
import { HomeToolsPreview } from "@/features/tools";

import { HomeSignedInDashboard } from "./HomeSignedInDashboard";
import { fetchPublicToolListings } from "@/lib/convexServer";

/** One Convex + Clerk tree for signed-in homepage sections (tools + loans). */
export async function HomeDashboardGate() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    const tools = await fetchPublicToolListings();

    return (
      <HomeToolsPreview
        isAuthenticated={false}
        publicTools={tools ?? []}
        loadFailed={tools === null}
      />
    );
  }

  return (
    <ConvexClerkProviders>
      <HomeSignedInDashboard />
    </ConvexClerkProviders>
  );
}
