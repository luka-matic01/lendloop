import { Button } from "@/components/ui";
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
  const showBorrow = onBorrow !== undefined && !tool.isOwner;
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
                "min-w-0 truncate sm:whitespace-normal",
              )}
            >
              {tool.ownerName}
              {tool.ownerIsTrustedLender ? (
                <span className="text-positive"> · Trusted</span>
              ) : null}
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
