"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button, Container, Panel } from "@/components/ui";
import { useEnsureCurrentUser } from "@/features/account";
import {
  BorrowRequestModal,
  MarkReturnedConfirmModal,
  TrustedLenderConfirmModal,
  useLoanActions,
} from "@/features/loans";

import { TOOLS_COPY } from "../constants/copy";
import type { BoardTool } from "../types/tools";
import { TOOLS_ICON_CLASS, TOOLS_PAGE_CLASS } from "../constants/visual";
import { useListingActions } from "../hooks/useListingActions";
import { ListingConfirmModal } from "./ListingConfirmModal";
import { NeighborToolsSection } from "./NeighborToolsSection";
import { ToolFormModal } from "./ToolFormModal";
import { MyListingsSection } from "./MyListingsSection";

type ToolsPageClientProps = {
  intro: ReactNode;
};

export function ToolsPageClient({ intro }: ToolsPageClientProps) {
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
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">{intro}</div>
          <Button
            type="button"
            size="sm"
            className="max-w-[11rem] shrink-0 gap-1.5 px-2.5 text-sm sm:max-w-none sm:px-5 sm:text-base"
            onClick={openListModal}
            disabled={!isReady}
          >
            <Plus className={TOOLS_ICON_CLASS} aria-hidden />
            {TOOLS_COPY.listTool}
          </Button>
        </header>

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
