"use client";

import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";

import { Button, Container, Panel } from "@/components/ui";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import {
  TOOL_CATEGORY_LABELS,
  TOOL_CATEGORY_OPTIONS,
  TOOL_CONDITION_LABELS,
  TOOL_CONDITION_OPTIONS,
  type ToolCategoryKey,
  type ToolConditionKey,
} from "../constants/labels";

const fieldClass =
  "w-full rounded-control border-2 border-ink bg-surface px-3 py-2 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export function ToolBoardPage() {
  const me = useQuery(api.users.me);
  const tools = useQuery(api.tools.listMine);
  const createTool = useMutation(api.tools.create);
  const removeTool = useMutation(api.tools.remove);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ToolCategoryKey>("power_tools");
  const [condition, setCondition] = useState<ToolConditionKey>("good");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await createTool({ name, category, condition, description });
      setName("");
      setDescription("");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not add tool",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(toolId: Id<"tools">) {
    setFormError(null);
    try {
      await removeTool({ toolId });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not remove tool",
      );
    }
  }

  if (me === undefined || tools === undefined) {
    return (
      <Container className="py-section-y">
        <p className="text-base text-ink-muted">Loading your board…</p>
      </Container>
    );
  }

  return (
    <Container className="space-y-10 py-section-y">
      <div className="border-b-2 border-ink pb-5">
        <h1 className="font-display text-5xl font-extrabold leading-none text-ink">
          Tools
        </h1>
        <p className="mt-3 text-base text-ink-muted">
          Signed in as {me.name} ({me.role})
          {me.isTrustedLender ? " · Trusted lender" : ""}
        </p>
      </div>

      <Panel>
        <h2 className="font-display text-3xl font-bold leading-none text-ink">
          List a tool
        </h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1 text-sm font-medium text-ink">
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
              placeholder="18V drill/driver"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm font-medium text-ink">
              Category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ToolCategoryKey)
                }
                className={fieldClass}
              >
                {TOOL_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1 text-sm font-medium text-ink">
              Condition
              <select
                value={condition}
                onChange={(event) =>
                  setCondition(event.target.value as ToolConditionKey)
                }
                className={fieldClass}
              >
                {TOOL_CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium text-ink">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className={fieldClass}
              placeholder="Bits included, pickup notes, etc."
            />
          </label>
          {formError ? (
            <p className="text-sm text-negative" role="alert">
              {formError}
            </p>
          ) : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding…" : "Add to board"}
          </Button>
        </form>
      </Panel>

      <div>
        <h2 className="font-display text-3xl font-bold leading-none text-ink">
          Your listings
        </h2>
        {tools.length === 0 ? (
          <Panel className="mt-6">
            <p className="text-base text-ink-muted">
              Nothing on the board yet. Add your first tool above.
            </p>
          </Panel>
        ) : (
          <ul className="mt-6 space-y-4">
            {tools.map((tool) => (
              <li key={tool._id}>
                <Panel className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-bold leading-none text-ink">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                      {TOOL_CATEGORY_LABELS[tool.category]} ·{" "}
                      {TOOL_CONDITION_LABELS[tool.condition]}
                      {!tool.isAvailable ? " · Hidden" : ""}
                    </p>
                    {tool.description ? (
                      <p className="mt-3 text-base text-ink-muted">
                        {tool.description}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemove(tool._id)}
                  >
                    Remove
                  </Button>
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
