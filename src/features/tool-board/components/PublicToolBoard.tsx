"use client";

import { useMemo, useState } from "react";

import { Container, Panel } from "@/components/ui";
import type { PublicToolListing } from "@/lib/convex-server";

import {
  TOOL_CATEGORY_LABELS,
  TOOL_CATEGORY_OPTIONS,
  type ToolCategoryKey,
} from "../constants/labels";

type PublicToolBoardProps = {
  tools: PublicToolListing[];
  loadFailed?: boolean;
};

export function PublicToolBoard({ tools, loadFailed }: PublicToolBoardProps) {
  const [category, setCategory] = useState<ToolCategoryKey | "all">("all");

  const filtered = useMemo(() => {
    if (category === "all") {
      return tools;
    }
    return tools.filter((tool) => tool.category === category);
  }, [category, tools]);

  return (
    <section aria-labelledby="public-board-heading">
      <Container className="py-section-y">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="public-board-heading"
              className="font-display text-4xl font-extrabold leading-none text-ink"
            >
              On the board
            </h2>
            <p className="mt-2 text-base text-ink-muted">
              Names and categories in the neighborhood.
            </p>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Category
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ToolCategoryKey | "all")
              }
              className="min-w-[10rem] rounded-control border-2 border-ink bg-surface px-3 py-2 text-base font-normal text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <option value="all">All categories</option>
              {TOOL_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loadFailed ? (
          <Panel tone="notice" className="mt-8">
            <p className="text-base text-ink-muted">
              Could not load the board. Check that Convex is running, then
              refresh.
            </p>
          </Panel>
        ) : filtered.length === 0 ? (
          <Panel className="mt-8">
            <p className="text-base text-ink-muted">
              {tools.length === 0
                ? "Nothing listed yet."
                : "No tools in this category."}
            </p>
          </Panel>
        ) : (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {filtered.map((tool) => (
              <li
                key={tool._id}
                className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6"
              >
                <span className="font-display text-2xl font-bold leading-none text-ink">
                  {tool.name}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {TOOL_CATEGORY_LABELS[tool.category]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
