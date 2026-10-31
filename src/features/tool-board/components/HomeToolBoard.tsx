"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { ConfirmModal, Panel, useToast } from "@/components/ui";
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
  const toast = useToast();
  const { phase } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const boardToolsQuery = useQuery(api.tools.listBoard, isReady ? {} : "skip");
  const removeTool = useMutation(api.tools.remove);
  const [removeConfirm, setRemoveConfirm] = useState<{
    toolId: Id<"tools">;
    name: string;
  } | null>(null);
  const [removeSubmitting, setRemoveSubmitting] = useState(false);

  const isLoading = !isReady || boardToolsQuery === undefined;

  const previewTools = useMemo(() => {
    if (boardToolsQuery === undefined) {
      return [];
    }
    return boardToolsQuery.slice(0, HOME_BOARD_PREVIEW_LIMIT);
  }, [boardToolsQuery]);

  const confirmRemove = useCallback(async () => {
    if (!removeConfirm) {
      return;
    }
    setRemoveSubmitting(true);
    try {
      await removeTool({ toolId: removeConfirm.toolId });
      toast(TOOL_BOARD_COPY.toastListingRemoved(removeConfirm.name));
      setRemoveConfirm(null);
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not remove tool",
        "error",
      );
    } finally {
      setRemoveSubmitting(false);
    }
  }, [removeConfirm, removeTool, toast]);

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
          <ConfirmModal
            open={removeConfirm !== null}
            title={
              removeConfirm
                ? TOOL_BOARD_COPY.confirmRemoveTitle(removeConfirm.name)
                : ""
            }
            description={TOOL_BOARD_COPY.confirmRemoveDescription}
            confirmLabel={
              removeConfirm
                ? TOOL_BOARD_COPY.confirmRemoveAction(removeConfirm.name)
                : ""
            }
            cancelLabel={TOOL_BOARD_COPY.cancel}
            confirming={removeSubmitting}
            onConfirm={confirmRemove}
            onCancel={() => {
              if (!removeSubmitting) {
                setRemoveConfirm(null);
              }
            }}
          />

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
                    onRemove={() =>
                      setRemoveConfirm({ toolId: tool._id, name: tool.name })
                    }
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
