"use client";

import Link from "next/link";
import { useState } from "react";

import {
  buttonClassName,
  HomeFeatureSection,
  HomePreviewBody,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import type { AccountSyncState } from "@/features/account";
import {
  BorrowRequestModal,
  TrustedLenderConfirmModal,
  useLoanActions,
} from "@/features/loans";

import { TOOLS_COPY } from "../constants/copy";
import { useHomeBoardPreview } from "../hooks/useHomeBoardPreview";
import { useListingActions } from "../hooks/useListingActions";
import type { BoardTool } from "../types/tools";
import { ListingConfirmModal } from "./ListingConfirmModal";
import { NeighborToolCardFromActions } from "./NeighborToolCard";
import { ToolCardGrid } from "./ToolCardGrid";
import { ToolCardSkeletonGrid } from "./ToolSkeletons";

type HomeToolsSignedInPreviewProps = {
  accountSync: AccountSyncState;
};

export function HomeToolsSignedInPreview({
  accountSync,
}: HomeToolsSignedInPreviewProps) {
  const loanActions = useLoanActions();
  const listingActions = useListingActions();
  const [borrowingTool, setBorrowingTool] = useState<BoardTool | null>(null);

  const isReady = accountSync.phase === "ready";
  const syncFailed = accountSync.phase === "error";
  const { preview, isLoading: boardLoading } = useHomeBoardPreview(isReady);
  const isLoading = !syncFailed && boardLoading;

  return (
    <HomeFeatureSection
      headingId="public-board-heading"
      title={TOOLS_COPY.homeBoardTitle}
      description={TOOLS_COPY.homeBoardSignedInDescription}
      busy={isLoading}
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

      <HomePreviewBody
        syncFailed={syncFailed}
        errorMessage={accountSync.errorMessage}
        isLoading={isLoading}
        loading={
          <ToolCardSkeletonGrid label="Loading tools on the board" />
        }
      >
        <div className="space-y-4">
          <ToolCardGrid
            tools={preview}
            renderCard={(tool) => (
              <NeighborToolCardFromActions
                tool={tool}
                onBorrow={() => setBorrowingTool(tool)}
                listingActions={listingActions}
                loanActions={loanActions}
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
      </HomePreviewBody>
    </HomeFeatureSection>
  );
}
