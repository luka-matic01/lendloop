import { Button } from "@/components/ui";

import type { BoardTool } from "../types/tools";
import { TOOL_CARD_FOOTER_TEXT_CLASS } from "../constants/visual";
import { toolCardDescription } from "../utils/toolCardCopy";
import { ToolCardLayout } from "./ToolCardLayout";

type BoardToolCardProps = {
  tool: BoardTool;
  onRemove: () => void;
};

export function BoardToolCard({ tool, onRemove }: BoardToolCardProps) {
  const showRemove = tool.canRemove && !tool.isOwner;
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
        <div className="flex min-w-0 items-end justify-between gap-2">
          <p className={TOOL_CARD_FOOTER_TEXT_CLASS}>
            {tool.ownerName}
            {tool.ownerIsTrustedLender ? (
              <span className="text-positive"> · Trusted</span>
            ) : null}
          </p>
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
        )
      }
    />
  );
}
