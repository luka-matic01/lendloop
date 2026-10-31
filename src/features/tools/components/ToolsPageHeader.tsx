import { Plus } from "lucide-react";

import { Button } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import { TOOLS_ICON_CLASS } from "../constants/visual";

type ToolsPageHeaderProps = {
  onListTool: () => void;
  listDisabled?: boolean;
};

export function ToolsPageHeader({
  onListTool,
  listDisabled = false,
}: ToolsPageHeaderProps) {
  return (
    <header className="space-y-2 sm:space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl">
          {TOOLS_COPY.pageTitle}
        </h1>
        <Button
          type="button"
          size="sm"
          className="max-w-[11rem] shrink-0 gap-1.5 px-2.5 text-sm sm:max-w-none sm:px-5 sm:text-base"
          onClick={onListTool}
          disabled={listDisabled}
        >
          <Plus className={TOOLS_ICON_CLASS} aria-hidden />
          {TOOLS_COPY.listTool}
        </Button>
      </div>
      <p className="max-w-xl text-sm text-ink-muted sm:text-base">
        {TOOLS_COPY.pageDescription}
      </p>
    </header>
  );
}
