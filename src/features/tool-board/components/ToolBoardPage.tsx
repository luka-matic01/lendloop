"use client";

import { Container, Panel } from "@/components/ui";

import { TOOL_BOARD_COPY } from "../constants/copy";
import { TOOL_BOARD_PAGE_CLASS } from "../constants/visual";
import { useToolBoard } from "../hooks/useToolBoard";
import { AvailableToolsSection } from "./AvailableToolsSection";
import { ListToolModal } from "./ListToolModal";
import { MyListingsSection } from "./MyListingsSection";
import { ToolBoardHeader } from "./ToolBoardHeader";

export function ToolBoardPage() {
  const {
    phase,
    errorMessage,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    listModalOpen,
    openListModal,
    closeListModal,
    boardTools,
    myTools,
    neighborBoardTools,
    neighborTotalOnBoard,
    myLiveOnBoardCount,
    actionError,
    removeBoardTool,
    toggleListingAvailability,
  } = useToolBoard();

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

      <ListToolModal open={listModalOpen} onClose={closeListModal} />

      {actionError ? (
        <Panel tone="notice" role="alert">
          <p className="text-sm text-negative">{actionError}</p>
        </Panel>
      ) : null}

      <AvailableToolsSection
        isLoading={isLoading}
        tools={neighborBoardTools}
        totalOnBoard={boardTools.length}
        neighborTotalOnBoard={neighborTotalOnBoard}
        myLiveOnBoardCount={myLiveOnBoardCount}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onRemoveTool={removeBoardTool}
      />

      <MyListingsSection
        isLoading={isLoading}
        tools={myTools}
        onToggleAvailability={toggleListingAvailability}
        onRemove={removeBoardTool}
      />
    </Container>
  );
}
