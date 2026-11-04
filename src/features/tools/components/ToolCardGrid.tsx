import type { ReactNode } from "react";

import { Panel } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import { TOOL_CARD_GRID_CLASS } from "../constants/visual";

type ToolCardGridProps<T> = {
  tools: T[];
  emptyMessage?: string;
  itemKey?: (tool: T, index: number) => string;
  renderCard: (tool: T) => ReactNode;
};

export function ToolCardGrid<T>({
  tools,
  emptyMessage = TOOLS_COPY.emptyBoard,
  itemKey,
  renderCard,
}: ToolCardGridProps<T>) {
  if (tools.length === 0) {
    return (
      <Panel>
        <p className="text-base text-ink-muted">{emptyMessage}</p>
      </Panel>
    );
  }

  return (
    <ul className={TOOL_CARD_GRID_CLASS}>
      {tools.map((tool, index) => (
        <li
          key={
            itemKey?.(tool, index) ??
            (typeof tool === "object" &&
            tool !== null &&
            "_id" in tool &&
            typeof (tool as { _id: unknown })._id === "string"
              ? (tool as { _id: string })._id
              : String(index))
          }
          className="min-h-0"
        >
          {renderCard(tool)}
        </li>
      ))}
    </ul>
  );
}
