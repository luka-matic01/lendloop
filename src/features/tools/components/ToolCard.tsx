import { Button, TrustedLenderIndicator } from "@/components/ui";
import { cn } from "@/lib/utils";

import { TOOLS_COPY } from "../constants/copy";
import { TOOL_CARD_FOOTER_TEXT_CLASS } from "../constants/visual";
import type { BoardTool } from "../types/tools";
import { toolCardDescription } from "../utils/toolCardCopy";
import { ToolCardLayout } from "./ToolCardLayout";

type ToolCardProps = {
  tool: BoardTool;
  onRemove?: () => void;
  onBorrow?: () => void;
};

export function ToolCard({ tool, onRemove, onBorrow }: ToolCardProps) {
  const showRemove = onRemove !== undefined && tool.canRemove && !tool.isOwner;
  const borrowBlocked = tool.viewerBorrowStatus !== undefined;
  const showBorrow =
    onBorrow !== undefined && !tool.isOwner && !borrowBlocked;
  const borrowStatusLabel =
    tool.viewerBorrowStatus === "approved"
      ? TOOLS_COPY.activeBorrowOnLoan
      : tool.viewerBorrowStatus === "pending"
        ? TOOLS_COPY.pendingBorrowRequest
        : null;
  const description = toolCardDescription(tool.name, tool.description);

  return (
    <ToolCardLayout
      category={tool.category}
      condition={tool.condition}
      name={tool.name}
      description={description}
      isOwnListing={tool.isOwner}
      footer={
        tool.isOwner ? undefined : (
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p
              className={cn(
                TOOL_CARD_FOOTER_TEXT_CLASS,
                "flex min-w-0 items-center gap-x-1 truncate sm:whitespace-normal",
              )}
            >
              <span className="truncate">{tool.ownerName}</span>
              {tool.ownerIsTrustedLender ? <TrustedLenderIndicator /> : null}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              {showBorrow ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  aria-label={`Borrow ${tool.name}`}
                  onClick={onBorrow}
                >
                  {TOOLS_COPY.borrowTool}
                </Button>
              ) : borrowStatusLabel ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled
                  aria-label={`${borrowStatusLabel} for ${tool.name}`}
                >
                  {borrowStatusLabel}
                </Button>
              ) : null}
              {showRemove ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onRemove}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        )
      }
    />
  );
}
