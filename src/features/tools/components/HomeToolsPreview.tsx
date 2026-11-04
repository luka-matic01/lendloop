"use client";

import { useMemo } from "react";

import { Panel } from "@/components/ui";
import type { AccountSyncState } from "@/features/account";
import { HomeFeatureSection } from "@/features/home/components/HomeFeatureSection";
import type { PublicToolListing } from "@/lib/convexServer";

import { TOOLS_COPY } from "../constants/copy";
import { pickHomeBoardPreview } from "../utils/pickHomeBoardPreview";
import { HomeToolsSignedInPreview } from "./HomeToolsSignedInPreview";
import { PublicToolCard } from "./PublicToolCard";
import { ToolCardGrid } from "./ToolCardGrid";

type HomeToolsPreviewProps = {
  isAuthenticated: boolean;
  accountSync?: AccountSyncState;
  publicTools?: PublicToolListing[];
  loadFailed?: boolean;
};

export function HomeToolsPreview({
  isAuthenticated,
  accountSync,
  publicTools = [],
  loadFailed = false,
}: HomeToolsPreviewProps) {
  if (isAuthenticated) {
    return (
      <HomeToolsSignedInPreview
        accountSync={
          accountSync ?? { phase: "syncing", errorMessage: null }
        }
      />
    );
  }

  return <HomeToolsPublicPreview publicTools={publicTools} loadFailed={loadFailed} />;
}

type HomeToolsPublicPreviewProps = {
  publicTools: PublicToolListing[];
  loadFailed: boolean;
};

function HomeToolsPublicPreview({
  publicTools,
  loadFailed,
}: HomeToolsPublicPreviewProps) {
  const preview = useMemo(
    () => pickHomeBoardPreview(publicTools),
    [publicTools],
  );

  return (
    <HomeFeatureSection
      headingId="public-board-heading"
      title={TOOLS_COPY.homeBoardTitle}
      description={TOOLS_COPY.homeBoardPublicDescription}
    >
      {loadFailed ? (
        <Panel tone="notice">
          <p className="text-base text-ink-muted">
            Could not load the board. Check that Convex is running, then
            refresh.
          </p>
        </Panel>
      ) : (
        <ToolCardGrid
          tools={preview}
          renderCard={(tool) => (
            <PublicToolCard tool={tool} className="h-full" />
          )}
        />
      )}
    </HomeFeatureSection>
  );
}

