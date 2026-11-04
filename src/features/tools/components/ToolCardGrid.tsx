import type { ReactNode } from "react";

import { Panel } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import { TOOL_CARD_GRID_CLASS } from "../constants/visual";

type ToolCardGridProps<T extends { _id: string }> = {
  tools: T[];
  emptyMessage?: string;
  renderCard: (tool: T) => ReactNode;
};

export function ToolCardGrid<T extends { _id: string }>({
  tools,
  emptyMessage = TOOLS_COPY.emptyBoard,
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
      {tools.map((tool) => (
        <li key={tool._id} className="min-h-0">
          {renderCard(tool)}
        </li>
      ))}
    </ul>
  );
}
