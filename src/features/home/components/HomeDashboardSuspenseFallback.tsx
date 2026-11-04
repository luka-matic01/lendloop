import { HomeToolsPreviewSkeleton } from "@/features/tools";

/**
 * Static Suspense fallback (PPR-safe — no request/auth reads). Neutral card
 * chrome until server {@link HomeDashboardGate} streams the signed-in/out branch.
 */
export function HomeDashboardSuspenseFallback() {
  return <HomeToolsPreviewSkeleton variant="pending" />;
}
