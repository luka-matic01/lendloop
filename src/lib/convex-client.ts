"use client";

import { ConvexReactClient } from "convex/react";

import { publicEnv } from "@/constants";

let browserClient: ConvexReactClient | undefined;

/**
 * One Convex client for the browser session. Must only be created from a Client
 * Component rendered inside `<Suspense>` so Next.js can partial-prerender the shell.
 */
export function getConvexReactClient(): ConvexReactClient {
  if (!publicEnv.convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured.");
  }

  if (!browserClient) {
    browserClient = new ConvexReactClient(publicEnv.convexUrl);
  }

  return browserClient;
}
