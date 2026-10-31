import { ConvexHttpClient } from "convex/browser";

import { api } from "convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type PublicToolListing = FunctionReturnType<
  typeof api.tools.listPublic
>[number];

let httpClient: ConvexHttpClient | undefined;

function getConvexHttpClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || !url.startsWith("http")) {
    return null;
  }

  if (!httpClient) {
    httpClient = new ConvexHttpClient(url);
  }

  return httpClient;
}

export async function fetchPublicToolListings(): Promise<
  PublicToolListing[] | null
> {
  const client = getConvexHttpClient();
  if (!client) {
    return null;
  }

  try {
    return await client.query(api.tools.listPublic, {});
  } catch {
    return null;
  }
}
