"use client";

import { useMutation } from "convex/react";
import { FormEvent, useId, useRef, useState } from "react";

import {
  fieldClass,
  fieldLabelClass,
  Select,
  useToast,
} from "@/components/ui";
import { Modal, ModalActions, ModalHeader } from "@/components/ui/Modal";
import { convexErrorMessage } from "@/lib/convexErrorMessage";
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
  const errorId = useId();
  const categoryId = useId();
  const conditionId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const createTool = useMutation(api.tools.create);
  const updateTool = useMutation(api.tools.update);
  const isEditing = tool != null;

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    <Modal
      open={open}
      onClose={onClose}
      size="form"
      dismissible={!submitting}
      initialFocusRef={nameInputRef}
      describedBy={formError ? errorId : undefined}
    >
      <ModalHeader
        title={
          isEditing
            ? TOOLS_COPY.editListingTitle(tool.name)
            : TOOLS_COPY.modalTitle
        }
        closeDisabled={submitting}
        onClose={onClose}
      />

      <form
        key={`${open}-${tool?._id ?? "new"}`}
        className="mt-6 space-y-4"
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

        <ModalActions
          cancelLabel={TOOLS_COPY.cancel}
          cancelDisabled={submitting}
          onCancel={onClose}
          primaryType="submit"
          primaryDisabled={submitting}
          primaryLabel={
            submitting
              ? isEditing
                ? TOOLS_COPY.savingListing
                : TOOLS_COPY.adding
              : isEditing
                ? TOOLS_COPY.saveListingAction
                : TOOLS_COPY.addToBoardAction
          }
          primaryTitle={
            isEditing ? TOOLS_COPY.saveListing : TOOLS_COPY.addToBoard
          }
        />
      </form>
    </Modal>
  );
}
