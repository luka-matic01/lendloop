"use client";

import { useState } from "react";

import { ConfirmModal, Container, Panel } from "@/components/ui";
import {
  BorrowRequestModal,
  MarkReturnedConfirmModal,
  TrustedLenderConfirmModal,
  useLoanActions,
} from "@/features/loans";

import { TOOLS_COPY } from "../constants/copy";
import type { BoardTool } from "../types/tools";
import { TOOLS_PAGE_CLASS } from "../constants/visual";
import { type ListingConfirm, useToolsPage } from "../hooks/useToolsPage";
import { NeighborToolsSection } from "./NeighborToolsSection";
import { ToolFormModal } from "./ToolFormModal";
import { MyListingsSection } from "./MyListingsSection";
import { ToolsPageHeader } from "./ToolsPageHeader";

function listingConfirmModalCopy(listingConfirm: ListingConfirm) {
  if (listingConfirm.type === "remove") {
    const { name, ownerName } = listingConfirm;
    return {
      title: TOOLS_COPY.confirmRemoveTitle(name),
      description: ownerName
        ? TOOLS_COPY.confirmRemoveNeighborDescription(ownerName)
        : TOOLS_COPY.confirmRemoveDescription,
      confirmLabel: TOOLS_COPY.confirmRemoveAction(name),
    };
  }

  const { name } = listingConfirm.tool;
  const pausing = listingConfirm.tool.isAvailable;
  return {
    title: pausing
      ? TOOLS_COPY.confirmPauseTitle(name)
      : TOOLS_COPY.confirmPutOnBoardTitle(name),
    description: pausing
      ? TOOLS_COPY.confirmPauseDescription
      : TOOLS_COPY.confirmPutOnBoardDescription,
    confirmLabel: pausing
      ? TOOLS_COPY.confirmPauseAction(name)
      : TOOLS_COPY.confirmPutOnBoardAction(name),
  };
}

export function ToolsPage() {
  const [borrowingTool, setBorrowingTool] = useState<BoardTool | null>(null);
  const loanActions = useLoanActions();
  const {
    pendingId: markReturnedPendingId,
    pendingTrustedUserId,
    requestMarkReturned,
    requestTrustedLenderChange,
  } = loanActions;

  const {
    phase,
    errorMessage,
    isPageBootstrapping,
    neighborBoardLoading,
    neighborBoardRefreshing,
    categoryFilter,
    setCategoryFilter,
    editingTool,
    toolFormModalOpen,
    openListModal,
    openEditModal,
    closeToolFormModal,
    boardIsEmpty,
    myTools,
    neighborBoardTools,
    neighborTotalOnBoard,
    boardCanLoadMore,
    boardLoadingMore,
    loadMoreBoardPage,
    myListingsCanLoadMore,
    myListingsLoadingMore,
    loadMoreMyListingsPage,
    listingConfirm,
    confirmSubmitting,
    requestRemoveListing,
    requestToggleListingAvailability,
    cancelListingConfirm,
    confirmListingAction,
  } = useToolsPage();

  const confirmCopy = listingConfirm
    ? listingConfirmModalCopy(listingConfirm)
    : null;

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
    <Container className={TOOLS_PAGE_CLASS}>
      <ToolsPageHeader
        onListTool={openListModal}
        listDisabled={isPageBootstrapping}
      />

      <ToolFormModal
        open={toolFormModalOpen}
        tool={editingTool}
        onClose={closeToolFormModal}
      />

      <BorrowRequestModal
        open={borrowingTool !== null}
        toolId={borrowingTool?._id ?? null}
        toolName={borrowingTool?.name ?? ""}
        onClose={() => setBorrowingTool(null)}
      />

      <ConfirmModal
        open={listingConfirm !== null}
        title={confirmCopy?.title ?? ""}
        description={confirmCopy?.description ?? ""}
        confirmLabel={confirmCopy?.confirmLabel ?? ""}
        cancelLabel={TOOLS_COPY.cancel}
        confirming={confirmSubmitting}
        onConfirm={confirmListingAction}
        onCancel={cancelListingConfirm}
      />

      <NeighborToolsSection
        isLoading={neighborBoardLoading}
        isRefreshing={neighborBoardRefreshing}
        tools={neighborBoardTools}
        boardIsEmpty={boardIsEmpty}
        neighborTotalOnBoard={neighborTotalOnBoard}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onRemoveTool={requestRemoveListing}
        onBorrowTool={setBorrowingTool}
        onTrustLender={(tool) =>
          requestTrustedLenderChange(
            tool.ownerId,
            tool.ownerName,
            !tool.ownerIsTrustedLender,
          )
        }
        pendingTrustedUserId={pendingTrustedUserId}
        canLoadMore={boardCanLoadMore}
        loadingMore={boardLoadingMore}
        onLoadMore={loadMoreBoardPage}
      />

      <MarkReturnedConfirmModal loanActions={loanActions} />
      <TrustedLenderConfirmModal loanActions={loanActions} />

      <MyListingsSection
        isLoading={isPageBootstrapping}
        tools={myTools}
        onEdit={openEditModal}
        onToggleAvailability={requestToggleListingAvailability}
        onRemove={requestRemoveListing}
        markReturnedPendingId={markReturnedPendingId}
        onMarkReturned={(requestId, toolName) =>
          requestMarkReturned(requestId, toolName, "incoming")
        }
        canLoadMore={myListingsCanLoadMore}
        loadingMore={myListingsLoadingMore}
        onLoadMore={loadMoreMyListingsPage}
      />
    </Container>
  );
}
