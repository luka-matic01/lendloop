import type { Id } from "convex/_generated/dataModel";

import type { useLoanActions } from "@/features/loans";

import type { useListingActions } from "../hooks/useListingActions";
import type { BoardTool } from "../types/tools";
import {
  neighborToolTrustCardProps,
  type RequestTrustedLenderChange,
} from "../utils/neighborToolTrust";
import { ToolCard } from "./ToolCard";

type NeighborToolCardProps = {
  tool: BoardTool;
  onBorrow: () => void;
  onRemove: () => void;
  requestTrustedLenderChange?: RequestTrustedLenderChange;
  pendingTrustedUserId?: Id<"users"> | null;
};

/** Board card with borrow, remove, and optional lender trust. */
export function NeighborToolCard({
  tool,
  onBorrow,
  onRemove,
  requestTrustedLenderChange,
  pendingTrustedUserId = null,
}: NeighborToolCardProps) {
  return (
    <ToolCard
      tool={tool}
      onBorrow={onBorrow}
      onRemove={onRemove}
      {...(requestTrustedLenderChange
        ? neighborToolTrustCardProps(
            tool,
            requestTrustedLenderChange,
            pendingTrustedUserId,
          )
        : {})}
    />
  );
}

type NeighborToolCardFromActionsProps = {
  tool: BoardTool;
  onBorrow: () => void;
  listingActions: ReturnType<typeof useListingActions>;
  loanActions: ReturnType<typeof useLoanActions>;
};

export function NeighborToolCardFromActions({
  tool,
  onBorrow,
  listingActions,
  loanActions,
}: NeighborToolCardFromActionsProps) {
  const { requestRemoveListing } = listingActions;
  const { pendingTrustedUserId, requestTrustedLenderChange } = loanActions;

  return (
    <NeighborToolCard
      tool={tool}
      onBorrow={onBorrow}
      onRemove={() => requestRemoveListing(tool)}
      requestTrustedLenderChange={requestTrustedLenderChange}
      pendingTrustedUserId={pendingTrustedUserId}
    />
  );
}
