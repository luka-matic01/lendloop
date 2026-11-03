import { Trash2 } from "lucide-react";

import {
  Button,
  IconButton,
  LenderTrustToggleIconButton,
  TrustedLenderIndicator,
} from "@/components/ui";
import { LOANS_COPY } from "@/features/loans";
import { formatBorrowDayMonth } from "@/lib/formatBorrowDue";
import { cn } from "@/lib/utils";

import { TOOLS_COPY } from "../constants/copy";
import {
  TOOL_CARD_FOOTER_TEXT_CLASS,
  TOOLS_ICON_CLASS,
} from "../constants/visual";
import type { BoardTool } from "../types/tools";
import { toolCardDescription } from "../utils/toolCardCopy";
import { ToolCardLayout } from "./ToolCardLayout";

type ToolCardProps = {
  tool: BoardTool;
  onRemove?: () => void;
  onBorrow?: () => void;
  onTrustLender?: () => void;
  trustPending?: boolean;
};

export function ToolCard({
  tool,
  onRemove,
  onBorrow,
  onTrustLender,
  trustPending = false,
}: ToolCardProps) {
  const canModerateBoard = !tool.isOwner && tool.canRemove;
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
  const showLoanNotice =
    tool.loanOutUntil !== undefined &&
    !tool.isOwner &&
    tool.viewerBorrowStatus !== "approved";

  return (
    <ToolCardLayout
      category={tool.category}
      condition={tool.condition}
      name={tool.name}
      description={description}
      isOwnListing={tool.isOwner}
      headerActions={
        canModerateBoard && onRemove ? (
          <IconButton
            type="button"
            variant="ghost"
            aria-label={TOOLS_COPY.removeListing}
            tooltip={TOOLS_COPY.removeListing}
            onClick={onRemove}
            className="text-ink-muted hover:bg-canvas hover:text-negative"
          >
            <Trash2 className={TOOLS_ICON_CLASS} aria-hidden />
          </IconButton>
        ) : undefined
      }
      notice={
        showLoanNotice ? (
          <p className="text-sm font-semibold leading-snug text-ink-muted">
            {TOOLS_COPY.boardOutUntil(
              formatBorrowDayMonth(tool.loanOutUntil!),
            )}
          </p>
        ) : null
      }
      footer={
        tool.isOwner ? undefined : (
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <p
              className={cn(
                TOOL_CARD_FOOTER_TEXT_CLASS,
                "inline-flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-snug",
              )}
            >
              <span className="truncate">{tool.ownerName}</span>
              {tool.ownerIsTrustedLender ? <TrustedLenderIndicator /> : null}
              {canModerateBoard && onTrustLender ? (
                <LenderTrustToggleIconButton
                  lenderName={tool.ownerName}
                  isTrusted={tool.ownerIsTrustedLender}
                  disabled={trustPending}
                  markTrustedLabel={LOANS_COPY.markTrusted}
                  removeTrustedLabel={LOANS_COPY.removeTrusted}
                  className="-my-1.5 shrink-0"
                  onClick={() => onTrustLender?.()}
                />
              ) : null}
            </p>

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
              <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-ink-muted">
                {borrowStatusLabel}
              </span>
            ) : null}
          </div>
        )
      }
    />
  );
}
