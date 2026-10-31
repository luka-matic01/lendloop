"use client";

import { ConfirmModal, Container, Panel } from "@/components/ui";

import { TOOL_BOARD_COPY } from "../constants/copy";
import { TOOL_BOARD_PAGE_CLASS } from "../constants/visual";
import { type ListingConfirm, useToolBoard } from "../hooks/useToolBoard";
import { AvailableToolsSection } from "./AvailableToolsSection";
import { ListToolModal } from "./ListToolModal";
import { MyListingsSection } from "./MyListingsSection";
import { ToolBoardHeader } from "./ToolBoardHeader";

function listingConfirmModalCopy(listingConfirm: ListingConfirm) {
  if (listingConfirm.type === "remove") {
    const { name } = listingConfirm;
    return {
      title: TOOL_BOARD_COPY.confirmRemoveTitle(name),
      description: TOOL_BOARD_COPY.confirmRemoveDescription,
      confirmLabel: TOOL_BOARD_COPY.confirmRemoveAction(name),
    };
  }

  const { name } = listingConfirm.tool;
  const pausing = listingConfirm.tool.isAvailable;
  return {
    title: pausing
      ? TOOL_BOARD_COPY.confirmPauseTitle(name)
      : TOOL_BOARD_COPY.confirmPutOnBoardTitle(name),
    description: pausing
      ? TOOL_BOARD_COPY.confirmPauseDescription
      : TOOL_BOARD_COPY.confirmPutOnBoardDescription,
    confirmLabel: pausing
      ? TOOL_BOARD_COPY.confirmPauseAction(name)
      : TOOL_BOARD_COPY.confirmPutOnBoardAction(name),
  };
}

export function ToolBoardPage() {
  const {
    phase,
    errorMessage,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    editingTool,
    toolFormModalOpen,
    openListModal,
    openEditModal,
    closeToolFormModal,
    boardTools,
    myTools,
    neighborBoardTools,
    neighborTotalOnBoard,
    myLiveOnBoardCount,
    listingConfirm,
    confirmSubmitting,
    requestRemoveListing,
    requestToggleListingAvailability,
    cancelListingConfirm,
    confirmListingAction,
  } = useToolBoard();

  const confirmCopy = listingConfirm
    ? listingConfirmModalCopy(listingConfirm)
    : null;

  if (phase === "error") {
    return (
      <Container className={TOOL_BOARD_PAGE_CLASS}>
        <Panel tone="notice">
          <p className="font-display text-2xl font-bold text-ink">
            {TOOL_BOARD_COPY.loadErrorTitle}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{errorMessage}</p>
        </Panel>
      </Container>
    );
  }

  return (
    <Container className={TOOL_BOARD_PAGE_CLASS}>
      <ToolBoardHeader onListTool={openListModal} listDisabled={isLoading} />

      <ListToolModal
        open={toolFormModalOpen}
        tool={editingTool}
        onClose={closeToolFormModal}
      />

      <ConfirmModal
        open={listingConfirm !== null}
        title={confirmCopy?.title ?? ""}
        description={confirmCopy?.description ?? ""}
        confirmLabel={confirmCopy?.confirmLabel ?? ""}
        cancelLabel={TOOL_BOARD_COPY.cancel}
        confirming={confirmSubmitting}
        onConfirm={confirmListingAction}
        onCancel={cancelListingConfirm}
      />

      <AvailableToolsSection
        isLoading={isLoading}
        tools={neighborBoardTools}
        totalOnBoard={boardTools.length}
        neighborTotalOnBoard={neighborTotalOnBoard}
        myLiveOnBoardCount={myLiveOnBoardCount}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onRemoveTool={requestRemoveListing}
      />

      <MyListingsSection
        isLoading={isLoading}
        tools={myTools}
        onEdit={openEditModal}
        onToggleAvailability={requestToggleListingAvailability}
        onRemove={requestRemoveListing}
      />
    </Container>
  );
}
