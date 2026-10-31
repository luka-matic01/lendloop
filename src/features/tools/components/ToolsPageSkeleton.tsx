"use client";

import { Container } from "@/components/ui";

import { TOOLS_PAGE_CLASS } from "../constants/visual";
import { NeighborToolsSection } from "./NeighborToolsSection";
import { MyListingsSection } from "./MyListingsSection";
import { ToolsPageHeader } from "./ToolsPageHeader";

/** Route-level stand-in that matches the tool board while the page segment loads. */
export function ToolsPageSkeleton() {
  return (
    <Container className={TOOLS_PAGE_CLASS}>
      <ToolsPageHeader onListTool={() => {}} listDisabled />
      <NeighborToolsSection
        isLoading
        tools={[]}
        totalOnBoard={0}
        neighborTotalOnBoard={0}
        categoryFilter="all"
        onCategoryChange={() => {}}
        onRemoveTool={() => {}}
        onBorrowTool={() => {}}
      />
      <MyListingsSection
        isLoading
        tools={[]}
        onEdit={() => {}}
        onToggleAvailability={() => {}}
        onRemove={() => {}}
      />
    </Container>
  );
}
