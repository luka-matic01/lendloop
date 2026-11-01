import type { Id } from "convex/_generated/dataModel";

import type { BoardTool } from "../types/tools";

export type RequestTrustedLenderChange = (
  userId: Id<"users">,
  name: string,
  grantTrust: boolean,
) => void;

export function neighborToolTrustCardProps(
  tool: BoardTool,
  requestTrustedLenderChange: RequestTrustedLenderChange,
  pendingTrustedUserId: Id<"users"> | null,
) {
  return {
    onTrustLender: () =>
      requestTrustedLenderChange(
        tool.ownerId,
        tool.ownerName,
        !tool.ownerIsTrustedLender,
      ),
    trustPending: pendingTrustedUserId === tool.ownerId,
  };
}
