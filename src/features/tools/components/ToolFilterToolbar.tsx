"use client";

import type { KeyboardEvent } from "react";

import { IconButton } from "@/components/ui";
import { fieldClass } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

import { TOOLS_COPY } from "../constants/copy";
import type { ToolCategoryKey } from "../constants/labels";
import { CategoryFilterBar } from "./CategoryFilterBar";

type ToolFilterToolbarProps = {
  idPrefix: string;
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: ToolCategoryKey | "all";
  onCategoryChange: (value: ToolCategoryKey | "all") => void;
  onReset: () => void;
};

export function ToolFilterToolbar({
  idPrefix,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onReset,
}: ToolFilterToolbarProps) {
  const searchId = `${idPrefix}-tool-search`;
  const categoryGroupId = `${idPrefix}-category-filter`;
  const toolbarLabelId = `${idPrefix}-toolbar-label`;

  const hasFilters =
    categoryFilter !== "all" || search.trim() !== "";

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onSearchChange("");
    }
  }

  return (
    <fieldset
      aria-labelledby={toolbarLabelId}
      className="space-y-3 border-0 p-0"
    >
      <legend id={toolbarLabelId} className="sr-only">
        {TOOLS_COPY.toolSearchLabel}. Filter by category.
      </legend>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <CategoryFilterBar
            id={categoryGroupId}
            value={categoryFilter}
            onChange={onCategoryChange}
          />
        </div>
        <div className="w-full shrink-0 lg:w-80">
          <label htmlFor={searchId} className="sr-only">
            {TOOLS_COPY.toolSearchLabel}
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <input
              id={searchId}
              type="search"
              name="tool-search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={TOOLS_COPY.toolSearchPlaceholder}
              autoComplete="off"
              className={cn(
                fieldClass,
                "w-full pl-9 pr-11 [&::-webkit-search-cancel-button]:appearance-none",
              )}
            />
            <div
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2",
                !hasFilters && "invisible",
              )}
            >
              <IconButton
                aria-label={TOOLS_COPY.clearFilters}
                tooltip={TOOLS_COPY.clearFilters}
                size="sm"
                onClick={onReset}
                tabIndex={hasFilters ? 0 : -1}
              >
                <X className="size-4" aria-hidden />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
