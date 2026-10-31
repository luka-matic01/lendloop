"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { Panel } from "@/components/ui";
import { useEnsureCurrentUser } from "@/features/account";
import type { PublicToolListing } from "@/lib/convex-server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { HOME_BOARD_PREVIEW_LIMIT, TOOL_BOARD_COPY } from "../constants/copy";
import { TOOL_CARD_GRID_CLASS } from "../constants/visual";
import { BoardToolCard } from "./BoardToolCard";
import { HomeBoardSection } from "./HomeBoardSection";
import { PublicToolCard } from "./PublicToolCard";
import { ToolCardSkeletonGrid } from "./ToolBoardSkeletons";

type HomeToolBoardProps = {
  isAuthenticated: boolean;
  publicTools?: PublicToolListing[];
  loadFailed?: boolean;
};

export function HomeToolBoard({
  isAuthenticated,
  publicTools = [],
  loadFailed = false,
}: HomeToolBoardProps) {
  if (isAuthenticated) {
    return <HomeSignedInBoard />;
  }

  return (
    <HomeBoardSection description={TOOL_BOARD_COPY.homeBoardPublicDescription}>
      {loadFailed ? (
        <Panel tone="notice" className="mt-6 sm:mt-8">
          <p className="text-base text-ink-muted">
            Could not load the board. Check that Convex is running, then
            refresh.
          </p>
        </Panel>
      ) : (
        <HomePublicToolList tools={publicTools} className="mt-6 sm:mt-8" />
      )}
    </HomeBoardSection>
  );
}

function HomePublicToolList({
  tools,
  className,
}: {
  tools: PublicToolListing[];
  className?: string;
}) {
  if (tools.length === 0) {
    return (
      <Panel className={className}>
        <p className="text-base text-ink-muted">{TOOL_BOARD_COPY.emptyBoard}</p>
      </Panel>
    );
  }

  return (
    <ul className={`${TOOL_CARD_GRID_CLASS} ${className ?? ""}`}>
      {tools.map((tool) => (
        <li key={tool._id} className="min-h-0">
          <PublicToolCard tool={tool} className="h-full" />
        </li>
      ))}
    </ul>
  );
}

function HomeSignedInBoard() {
  const { phase } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const boardToolsQuery = useQuery(api.tools.listBoard, isReady ? {} : "skip");
  const removeTool = useMutation(api.tools.remove);
  const [actionError, setActionError] = useState<string | null>(null);

  const isLoading = !isReady || boardToolsQuery === undefined;

  const previewTools = useMemo(() => {
    if (boardToolsQuery === undefined) {
      return [];
    }
    return boardToolsQuery.slice(0, HOME_BOARD_PREVIEW_LIMIT);
  }, [boardToolsQuery]);

  const removeBoardTool = useCallback(
    async (toolId: Id<"tools">) => {
      setActionError(null);
      try {
        await removeTool({ toolId });
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Could not remove tool",
        );
      }
    },
    [removeTool],
  );

  return (
    <HomeBoardSection
      busy={isLoading}
      description={TOOL_BOARD_COPY.homeBoardSignedInDescription}
    >
      {isLoading ? (
        <ToolCardSkeletonGrid
          className="mt-6 sm:mt-8"
          label="Loading tools on the board"
        />
      ) : (
        <div className="mt-6 sm:mt-8">
          {actionError ? (
            <Panel tone="notice" role="alert" className="mb-4">
              <p className="text-sm text-negative">{actionError}</p>
            </Panel>
          ) : null}

          {previewTools.length === 0 ? (
            <Panel>
              <p className="text-base text-ink-muted">
                {TOOL_BOARD_COPY.emptyBoard}
              </p>
            </Panel>
          ) : (
            <ul className={TOOL_CARD_GRID_CLASS}>
              {previewTools.map((tool) => (
                <li key={tool._id} className="min-h-0">
                  <BoardToolCard
                    tool={tool}
                    onRemove={() => removeBoardTool(tool._id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </HomeBoardSection>
  );
}
