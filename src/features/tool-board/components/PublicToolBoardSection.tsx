import { fetchPublicToolListings } from "@/lib/convex-server";

import { PublicToolBoard } from "./PublicToolBoard";

export async function PublicToolBoardSection() {
  const tools = await fetchPublicToolListings();

  if (tools === null) {
    return <PublicToolBoard tools={[]} loadFailed />;
  }

  return <PublicToolBoard tools={tools} />;
}
