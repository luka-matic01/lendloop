import type { ReactNode } from "react";

import { Panel } from "@/components/ui";

type HomePreviewBodyProps = {
  syncFailed: boolean;
  errorMessage?: string | null;
  isLoading: boolean;
  loading: ReactNode;
  children: ReactNode;
  defaultSyncError?: string;
};

/** Sync error / loading / content for signed-in home previews. */
export function HomePreviewBody({
  syncFailed,
  errorMessage,
  isLoading,
  loading,
  children,
  defaultSyncError = "Could not sync your account. Refresh and try again.",
}: HomePreviewBodyProps) {
  if (syncFailed) {
    return (
      <Panel tone="notice">
        <p className="text-base text-ink-muted">
          {errorMessage ?? defaultSyncError}
        </p>
      </Panel>
    );
  }

  if (isLoading) {
    return loading;
  }

  return children;
}
