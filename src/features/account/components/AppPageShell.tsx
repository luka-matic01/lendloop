"use client";

import { ReactNode, Suspense } from "react";

import { ConvexClerkProviders } from "@/components/providers/ConvexClerkProviders";
import { isAppConfigured } from "@/lib/app-config";

import { AppRouteLoading } from "./AppRouteLoading";

export function AppPageShell({ children }: { children: ReactNode }) {
  const { isReady } = isAppConfigured();
  const body = isReady ? (
    <ConvexClerkProviders>{children}</ConvexClerkProviders>
  ) : (
    children
  );

  return <Suspense fallback={<AppRouteLoading />}>{body}</Suspense>;
}
