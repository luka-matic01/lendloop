"use client";

import { Container } from "@/components/ui";

import { TOOL_BOARD_PAGE_CLASS } from "../constants/visual";
import { AvailableToolsSection } from "./AvailableToolsSection";
import { MyListingsSection } from "./MyListingsSection";
import { ToolBoardHeader } from "./ToolBoardHeader";

/** Route-level stand-in that matches the tool board while the page segment loads. */
export function ToolBoardSkeletonPage() {
  return (
    <Container className={TOOL_BOARD_PAGE_CLASS}>
      <ToolBoardHeader onListTool={() => {}} listDisabled />
      <AvailableToolsSection
        isLoading
        tools={[]}
        totalOnBoard={0}
        neighborTotalOnBoard={0}
        myLiveOnBoardCount={0}
        categoryFilter="all"
        onCategoryChange={() => {}}
        onRemoveTool={() => {}}
      />
      <MyListingsSection
        isLoading
        tools={[]}
        onToggleAvailability={() => {}}
        onRemove={() => {}}
      />
    </Container>
  );
}
