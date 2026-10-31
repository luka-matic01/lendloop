"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  TOOL_CATEGORY_OPTIONS,
  type ToolCategoryKey,
} from "../constants/labels";

type CategoryFilterBarProps = {
  value: ToolCategoryKey | "all";
  onChange: (value: ToolCategoryKey | "all") => void;
  id?: string;
};

export function CategoryFilterBar({
  value,
  onChange,
  id = "category-filter",
}: CategoryFilterBarProps) {
  return (
    <div
      role="group"
      aria-labelledby={id}
      className="flex flex-wrap gap-2"
    >
      <span id={id} className="sr-only">
        Filter by category
      </span>
      <FilterChip
        pressed={value === "all"}
        onClick={() => onChange("all")}
      >
        All
      </FilterChip>
      {TOOL_CATEGORY_OPTIONS.map((option) => (
        <FilterChip
          key={option.value}
          pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({
  children,
  pressed,
  onClick,
}: {
  children: ReactNode;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-control border-2 px-3 py-1.5 text-sm font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        pressed
          ? "border-ink bg-board text-on-board"
          : "border-line bg-surface text-ink-muted hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
