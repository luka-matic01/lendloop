"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { buttonClassName, Panel } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useEnsureCurrentUser } from "@/features/account";
import { BorrowRequestModal } from "@/features/loans";
import type { PublicToolListing } from "@/lib/convex-server";
import { api } from "convex/_generated/api";

import { HOME_BOARD_PREVIEW_LIMIT, TOOLS_COPY } from "../constants/copy";
import { TOOL_CARD_GRID_CLASS } from "../constants/visual";
import type { BoardTool } from "../types/tools";
import { HomeToolsFrame } from "./HomeToolsFrame";
import { PublicToolCard } from "./PublicToolCard";
import { ToolCard } from "./ToolCard";
import { ToolCardSkeletonGrid } from "./ToolSkeletons";

type HomeToolsPreviewProps = {
  isAuthenticated: boolean;
  publicTools?: PublicToolListing[];
  loadFailed?: boolean;
};

export function HomeToolsPreview({
  isAuthenticated,
  publicTools = [],
  loadFailed = false,
}: HomeToolsPreviewProps) {
  if (isAuthenticated) {
    return <HomeSignedInPreview />;
  }

  return (
    <HomeToolsFrame description={TOOLS_COPY.homeBoardPublicDescription}>
      <div className="space-y-4">
        {loadFailed ? (
          <Panel tone="notice">
            <p className="text-base text-ink-muted">
              Could not load the board. Check that Convex is running, then
              refresh.
            </p>
          </Panel>
        ) : (
          <HomePublicToolList tools={publicTools} />
        )}
      </div>
    </HomeToolsFrame>
  );
}

function HomePublicToolList({ tools }: { tools: PublicToolListing[] }) {
  if (tools.length === 0) {
    return (
      <Panel>
        <p className="text-base text-ink-muted">{TOOLS_COPY.emptyBoard}</p>
      </Panel>
    );
  }

  return (
    <ul className={TOOL_CARD_GRID_CLASS}>
      {tools.map((tool) => (
        <li key={tool._id} className="min-h-0">
          <PublicToolCard tool={tool} className="h-full" />
        </li>
      ))}
    </ul>
  );
}

function HomeSignedInPreview() {
  const [borrowingTool, setBorrowingTool] = useState<BoardTool | null>(null);
  const { phase } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const boardToolsQuery = useQuery(api.tools.listBoard, isReady ? {} : "skip");

  const isLoading = !isReady || boardToolsQuery === undefined;

  const previewTools = useMemo(() => {
    if (boardToolsQuery === undefined) {
      return [];
    }
    return boardToolsQuery
      .filter((tool) => !tool.isOwner)
      .slice(0, HOME_BOARD_PREVIEW_LIMIT);
  }, [boardToolsQuery]);

  return (
    <HomeToolsFrame
      busy={isLoading}
      description={TOOLS_COPY.homeBoardSignedInDescription}
    >
      <BorrowRequestModal
        open={borrowingTool !== null}
        toolId={borrowingTool?._id ?? null}
        toolName={borrowingTool?.name ?? ""}
        onClose={() => setBorrowingTool(null)}
      />
      {isLoading ? (
        <ToolCardSkeletonGrid label="Loading tools on the board" />
      ) : (
        <div className="space-y-4">
          {previewTools.length === 0 ? (
            <Panel>
              <p className="text-base text-ink-muted">
                {TOOLS_COPY.emptyBoard}
              </p>
            </Panel>
          ) : (
            <ul className={TOOL_CARD_GRID_CLASS}>
              {previewTools.map((tool) => (
                <li key={tool._id} className="min-h-0">
                  <ToolCard
                    tool={tool}
                    onBorrow={() => setBorrowingTool(tool)}
                  />
                </li>
              ))}
            </ul>
          )}
          <Link
            href={ROUTES.tools}
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            {TOOLS_COPY.seeFullBoard}
          </Link>
        </div>
      )}
    </HomeToolsFrame>
  );
}
