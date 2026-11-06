"use client";

import { useMemo } from "react";

import { useQuery } from "convex/react";

import { Button, Panel } from "@/components/ui";
import { useHoldoverRowsDuringRefetch } from "@/hooks/useHoldoverRowsDuringRefetch";
import type { AccountSyncState } from "@/features/account";
import { HomeFeatureSection } from "@/features/home/components/HomeFeatureSection";
import type { PublicToolListing } from "@/lib/convexServer";
import { api } from "convex/_generated/api";

import { TOOLS_COPY } from "../constants/copy";
import { useToolFilters } from "../hooks/useToolFilters";
import { pickHomeBoardPreview } from "../utils/pickHomeBoardPreview";
import { HomeToolsSignedInPreview } from "./HomeToolsSignedInPreview";
import { PublicToolCard } from "./PublicToolCard";
import { ToolCardGrid } from "./ToolCardGrid";
import { ToolFilterToolbar } from "./ToolFilterToolbar";

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

const NO_PUBLIC_ROWS: PublicToolListing[] = [];

function HomeToolsPublicPreview({
  publicTools,
  loadFailed,
}: HomeToolsPublicPreviewProps) {
  const {
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    isIdle,
    isSearchPending,
    queryArgs,
    reset,
  } = useToolFilters();

  const filteredList = useQuery(
    api.tools.listPublic,
    !loadFailed && !isIdle ? queryArgs : "skip",
  );

  const idlePreview = useMemo(
    () => pickHomeBoardPreview(publicTools),
    [publicTools],
  );

  const filteredRows =
    filteredList === undefined ? NO_PUBLIC_ROWS : filteredList;
  const loadingEmptyPublic =
    !loadFailed && !isIdle && filteredList === undefined;
  const { rowsToShow: holdoverPublicRows } = useHoldoverRowsDuringRefetch(
    filteredRows,
    loadingEmptyPublic,
  );

  const gridTools = isIdle ? idlePreview : holdoverPublicRows;
  const awaitingResults = loadingEmptyPublic;
  const showEmptyFiltered =
    !loadFailed &&
    !isIdle &&
    filteredList !== undefined &&
    filteredList.length === 0;
  const dimGrid = !isIdle && (awaitingResults || isSearchPending);

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
        <div className="space-y-4">
          <ToolFilterToolbar
            idPrefix="home-public"
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onReset={reset}
          />
          <div>
            {showEmptyFiltered ? (
              <Panel>
                <p className="text-base text-ink-muted">
                  {TOOLS_COPY.emptySearch}
                </p>
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={reset}
                  >
                    {TOOLS_COPY.clearFilters}
                  </Button>
                </div>
              </Panel>
            ) : (
              <div
                className={
                  dimGrid
                    ? "opacity-60 transition-opacity duration-150"
                    : undefined
                }
                aria-busy={dimGrid || undefined}
              >
                <ToolCardGrid
                  tools={gridTools}
                  itemKey={(tool, index) =>
                    `${tool.category}:${tool.name}:${index}`
                  }
                  renderCard={(tool) => (
                    <PublicToolCard tool={tool} className="h-full" />
                  )}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </HomeFeatureSection>
  );
}

