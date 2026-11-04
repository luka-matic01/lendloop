"use client";

import { useState } from "react";

import { Container, Panel } from "@/components/ui";
import { useEnsureCurrentUser } from "@/features/account";
import {
  BorrowRequestModal,
  MarkReturnedConfirmModal,
  TrustedLenderConfirmModal,
  useLoanActions,
} from "@/features/loans";

import { TOOLS_COPY } from "../constants/copy";
import type { BoardTool } from "../types/tools";
import { TOOLS_PAGE_CLASS } from "../constants/visual";
import { useListingActions } from "../hooks/useListingActions";
import { ListingConfirmModal } from "./ListingConfirmModal";
import { NeighborToolsSection } from "./NeighborToolsSection";
import { ToolFormModal } from "./ToolFormModal";
import { MyListingsSection } from "./MyListingsSection";
import { ToolsPageHeader } from "./ToolsPageHeader";

export function ToolsPage() {
  const { phase, errorMessage } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const [borrowingTool, setBorrowingTool] = useState<BoardTool | null>(null);
  const loanActions = useLoanActions();
  const listingActions = useListingActions();

  const {
    pendingId: markReturnedPendingId,
    pendingTrustedUserId,
    requestMarkReturned,
    requestTrustedLenderChange,
  } = loanActions;

  const {
    editingTool,
    toolFormModalOpen,
    openListModal,
    closeToolFormModal,
  } = listingActions;

  if (phase === "error") {
    return (
      <Container className={TOOLS_PAGE_CLASS}>
        <Panel tone="notice">
          <p className="font-display text-2xl font-bold text-ink">
            {TOOLS_COPY.loadErrorTitle}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{errorMessage}</p>
        </Panel>
      </Container>
    );
  }

  return (
    <>
      <Container className={TOOLS_PAGE_CLASS}>
        <ToolsPageHeader
          onListTool={openListModal}
          listDisabled={!isReady}
        />

        <NeighborToolsSection
          isReady={isReady}
          listingActions={listingActions}
          onBorrowTool={setBorrowingTool}
          requestTrustedLenderChange={requestTrustedLenderChange}
          pendingTrustedUserId={pendingTrustedUserId}
        />

        <MyListingsSection
          isReady={isReady}
          listingActions={listingActions}
          markReturnedPendingId={markReturnedPendingId}
          onMarkReturned={(requestId, toolName) =>
            requestMarkReturned(requestId, toolName, "incoming")
          }
        />
      </Container>

      <ToolFormModal
        open={toolFormModalOpen}
        tool={editingTool}
        onClose={closeToolFormModal}
      />

      <BorrowRequestModal
        open={borrowingTool !== null}
        toolId={borrowingTool?._id ?? null}
        toolName={borrowingTool?.name ?? ""}
        loanOutUntil={borrowingTool?.loanOutUntil}
        bookedRanges={borrowingTool?.bookedRanges}
        onClose={() => setBorrowingTool(null)}
      />

      <ListingConfirmModal listingActions={listingActions} />
      <MarkReturnedConfirmModal loanActions={loanActions} />
      <TrustedLenderConfirmModal loanActions={loanActions} />
    </>
  );
}
