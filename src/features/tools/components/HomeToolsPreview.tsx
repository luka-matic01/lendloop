"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { usePaginatedQuery } from "convex/react";

import { Panel, buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { AccountSyncState } from "@/features/account";
import {
  BorrowRequestModal,
  TrustedLenderConfirmModal,
  useLoanActions,
} from "@/features/loans";
import type { PublicToolListing } from "@/lib/convexServer";
import { api } from "convex/_generated/api";

import { TOOLS_COPY } from "../constants/copy";
import { useListingActions } from "../hooks/useListingActions";
import { ListingConfirmModal } from "./ListingConfirmModal";
import { HOME_BOARD_PAGE_SIZE } from "../constants/pagination";
import { TOOL_CARD_GRID_CLASS } from "../constants/visual";
import type { BoardTool } from "../types/tools";
import { pickHomeBoardPreview } from "../utils/pickHomeBoardPreview";
import { neighborToolTrustCardProps } from "../utils/neighborToolTrust";
import { HomeToolsFrame } from "./HomeToolsFrame";
import { PublicToolCard } from "./PublicToolCard";
import { ToolCard } from "./ToolCard";
import { ToolCardSkeletonGrid } from "./ToolSkeletons";

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
  const preview = useMemo(
    () => pickHomeBoardPreview(publicTools),
    [publicTools],
  );

  if (isAuthenticated) {
    return (
      <HomeSignedInPreview
        accountSync={
          accountSync ?? { phase: "syncing", errorMessage: null }
        }
      />
    );
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
          <HomeBoardToolGrid
            tools={preview}
            renderCard={(tool) => (
              <PublicToolCard tool={tool} className="h-full" />
            )}
          />
        )}
      </div>
    </HomeToolsFrame>
  );
}

function HomeBoardToolGrid<T extends { _id: string }>({
  tools,
  renderCard,
}: {
  tools: T[];
  renderCard: (tool: T) => ReactNode;
}) {
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
          {renderCard(tool)}
        </li>
      ))}
    </ul>
  );
}

function HomeSignedInPreview({ accountSync }: { accountSync: AccountSyncState }) {
  const loanActions = useLoanActions();
  const { pendingTrustedUserId, requestTrustedLenderChange } = loanActions;
  const listingActions = useListingActions();
  const { requestRemoveListing } = listingActions;
  const [borrowingTool, setBorrowingTool] = useState<BoardTool | null>(null);

  const isReady = accountSync.phase === "ready";
  const syncFailed = accountSync.phase === "error";

  const { results: boardTools, status: boardStatus } = usePaginatedQuery(
    api.tools.listBoard,
    isReady ? {} : "skip",
    { initialNumItems: HOME_BOARD_PAGE_SIZE },
  );

  const isLoading =
    !syncFailed && (!isReady || boardStatus === "LoadingFirstPage");

  const preview = useMemo(() => {
    const neighbors = boardTools.filter((tool) => !tool.isOwner);
    return pickHomeBoardPreview(neighbors);
  }, [boardTools]);

  return (
    <HomeToolsFrame
      busy={isLoading}
      description={TOOLS_COPY.homeBoardSignedInDescription}
    >
      <BorrowRequestModal
        open={borrowingTool !== null}
        toolId={borrowingTool?._id ?? null}
        toolName={borrowingTool?.name ?? ""}
        loanOutUntil={borrowingTool?.loanOutUntil}
        bookedRanges={borrowingTool?.bookedRanges}
        onClose={() => setBorrowingTool(null)}
      />
      <TrustedLenderConfirmModal loanActions={loanActions} />
      <ListingConfirmModal listingActions={listingActions} />
      {syncFailed ? (
        <Panel tone="notice">
          <p className="text-base text-ink-muted">
            {accountSync.errorMessage ??
              "Could not sync your account. Refresh and try again."}
          </p>
        </Panel>
      ) : isLoading ? (
        <ToolCardSkeletonGrid label="Loading tools on the board" />
      ) : (
        <div className="space-y-4">
          <HomeBoardToolGrid
            tools={preview}
            renderCard={(tool) => (
              <ToolCard
                tool={tool}
                onBorrow={() => setBorrowingTool(tool)}
                onRemove={() => requestRemoveListing(tool)}
                {...neighborToolTrustCardProps(
                  tool,
                  requestTrustedLenderChange,
                  pendingTrustedUserId,
                )}
              />
            )}
          />
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
