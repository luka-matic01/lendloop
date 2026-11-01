"use client";

import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { FormEvent, useEffect, useId, useRef, useState } from "react";

import {
  Button,
  fieldClass,
  fieldLabelClass,
  IconButton,
  Panel,
  Select,
  useToast,
} from "@/components/ui";
import { convexErrorMessage } from "@/lib/convex-error-message";
import { ModalTitle } from "@/components/ui/ModalTitle";
import {
  MODAL_DIALOG_CLASS,
  MODAL_PANEL_CLASS,
  syncModalDialogOpen,
} from "@/lib/modal-dialog";
import { cn } from "@/lib/utils";
import { api } from "convex/_generated/api";

import { TOOLS_COPY } from "../constants/copy";
import {
  TOOL_DESCRIPTION_MAX_LENGTH,
  TOOL_NAME_MAX_LENGTH,
} from "../constants/form";
import {
  TOOL_CATEGORY_LABELS,
  TOOL_CATEGORY_OPTIONS,
  TOOL_CONDITION_LABELS,
  TOOL_CONDITION_OPTIONS,
  type ToolCategoryKey,
  type ToolConditionKey,
} from "../constants/labels";
import { TOOLS_ICON_CLASS } from "../constants/visual";
import type { MyTool } from "../types/tools";

type ListToolFields = {
  name: string;
  category: ToolCategoryKey;
  condition: ToolConditionKey;
  description: string;
};

type ToolFormModalProps = {
  open: boolean;
  onClose: () => void;
  tool?: MyTool | null;
};

function readListToolFields(
  form: HTMLFormElement,
): { fields: ListToolFields } | { error: string } {
  const data = new FormData(form);
  const name = String(data.get("name") ?? "").trim();
  const description = String(data.get("description") ?? "").trim();
  const category = String(data.get("category") ?? "");
  const condition = String(data.get("condition") ?? "");

  if (!name) {
    return { error: "Tool name is required" };
  }
  if (!Object.hasOwn(TOOL_CATEGORY_LABELS, category)) {
    return { error: "Choose a category" };
  }
  if (!Object.hasOwn(TOOL_CONDITION_LABELS, condition)) {
    return { error: "Choose a condition" };
  }

  return {
    fields: {
      name,
      description,
      category: category as ToolCategoryKey,
      condition: condition as ToolConditionKey,
    },
  };
}

function listingUnchanged(tool: MyTool, fields: ListToolFields) {
  return (
    tool.name === fields.name &&
    tool.category === fields.category &&
    tool.condition === fields.condition &&
    tool.description === fields.description
  );
}

export function ToolFormModal({ open, onClose, tool = null }: ToolFormModalProps) {
  const titleId = useId();
  const errorId = useId();
  const categoryId = useId();
  const conditionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const createTool = useMutation(api.tools.create);
  const updateTool = useMutation(api.tools.update);
  const isEditing = tool != null;

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    syncModalDialogOpen(dialog, open, {
      initialFocus: open ? nameInputRef.current : null,
    });
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = readListToolFields(event.currentTarget);
    if ("error" in parsed) {
      setFormError(parsed.error);
      return;
    }

    const { fields } = parsed;
    if (isEditing && listingUnchanged(tool, fields)) {
      onClose();
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateTool({ toolId: tool._id, ...fields });
      } else {
        await createTool(fields);
      }
      toast(
        isEditing
          ? TOOLS_COPY.toastListingUpdated(fields.name)
          : TOOLS_COPY.toastListingCreated(fields.name),
      );
      onClose();
    } catch (error) {
      setFormError(
        convexErrorMessage(
          error,
          isEditing ? "Could not save listing" : "Could not add tool",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={MODAL_DIALOG_CLASS}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <Panel className={cn(MODAL_PANEL_CLASS, "max-w-lg")}>
        <div className="flex min-w-0 items-start justify-between gap-3">
          {isEditing ? (
            <ModalTitle
              id={titleId}
              size="form"
              className="flex-1 pr-2"
              title={TOOLS_COPY.editListingTitle(tool.name)}
            />
          ) : (
            <h2
              id={titleId}
              className="font-display text-3xl font-extrabold leading-none tracking-tight text-ink"
            >
              {TOOLS_COPY.modalTitle}
            </h2>
          )}
          <IconButton
            type="button"
            variant="ghost"
            className="text-ink-muted hover:text-ink"
            aria-label="Close"
            onClick={onClose}
          >
            <X className={TOOLS_ICON_CLASS} aria-hidden />
          </IconButton>
        </div>

        <form
          key={`${open}-${tool?._id ?? "new"}`}
          className="mt-6 space-y-4"
          aria-describedby={formError ? errorId : undefined}
          onSubmit={handleSubmit}
        >
          <label className="block space-y-1.5">
            <span className={fieldLabelClass}>Name</span>
            <input
              ref={nameInputRef}
              name="name"
              required
              maxLength={TOOL_NAME_MAX_LENGTH}
              defaultValue={tool?.name ?? ""}
              className={fieldClass}
              placeholder="18V cordless drill"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={categoryId} className={fieldLabelClass}>
                Category
              </label>
              <Select<ToolCategoryKey>
                id={categoryId}
                name="category"
                defaultValue={tool?.category ?? "power_tools"}
                options={TOOL_CATEGORY_OPTIONS}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={conditionId} className={fieldLabelClass}>
                Condition
              </label>
              <Select<ToolConditionKey>
                id={conditionId}
                name="condition"
                defaultValue={tool?.condition ?? "good"}
                options={TOOL_CONDITION_OPTIONS}
              />
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className={fieldLabelClass}>Notes</span>
            <textarea
              name="description"
              maxLength={TOOL_DESCRIPTION_MAX_LENGTH}
              defaultValue={tool?.description ?? ""}
              rows={3}
              className={fieldClass}
              placeholder="Pickup details, what's included…"
            />
          </label>

          {formError ? (
            <p id={errorId} className="text-sm text-negative" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting
              ? isEditing
                ? TOOLS_COPY.savingListing
                : TOOLS_COPY.adding
              : isEditing
                ? TOOLS_COPY.saveListing
                : TOOLS_COPY.addToBoard}
          </Button>
        </form>
      </Panel>
    </dialog>
  );
}
