"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils";

import { Button, Panel, Select } from "@/components/ui";

import { TOOL_BOARD_COPY } from "../constants/copy";
import {
  TOOL_DESCRIPTION_MAX_LENGTH,
  TOOL_NAME_MAX_LENGTH,
  toolFormFieldClass,
  toolFormLabelClass,
} from "../constants/form";
import {
  TOOL_CATEGORY_OPTIONS,
  TOOL_CONDITION_OPTIONS,
  type ToolCategoryKey,
  type ToolConditionKey,
} from "../constants/labels";
import { TOOL_BOARD_ICON_CLASS } from "../constants/visual";
import { useListToolForm } from "../hooks/useListToolForm";

type ListToolModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ListToolModal({ open, onClose }: ListToolModalProps) {
  const titleId = useId();
  const categoryId = useId();
  const conditionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleListed = useCallback(() => {
    onClose();
  }, [onClose]);

  const {
    name,
    setName,
    category,
    setCategory,
    condition,
    setCondition,
    description,
    setDescription,
    submitting,
    formError,
    reset,
    handleSubmit,
  } = useListToolForm({ onListed: handleListed });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-ink/40 open:flex open:items-center open:justify-center open:p-page-x"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          handleClose();
        }
      }}
    >
      <Panel className="w-full max-w-lg">
        <div className="flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="min-w-0 font-display text-3xl font-extrabold leading-none tracking-tight text-ink"
          >
            {TOOL_BOARD_COPY.modalTitle}
          </h2>
          <button
            type="button"
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control border-2 border-transparent p-1.5 text-ink-muted transition-colors",
              "hover:text-ink focus-visible:outline-none focus-visible:text-ink",
            )}
            aria-label="Close"
            onClick={handleClose}
          >
            <X className={TOOL_BOARD_ICON_CLASS} aria-hidden />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className={toolFormLabelClass}>Name</span>
            <input
              required
              autoFocus
              maxLength={TOOL_NAME_MAX_LENGTH}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={toolFormFieldClass}
              placeholder="18V cordless drill"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={categoryId} className={toolFormLabelClass}>
                Category
              </label>
              <Select<ToolCategoryKey>
                id={categoryId}
                value={category}
                onChange={setCategory}
                options={TOOL_CATEGORY_OPTIONS}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={conditionId} className={toolFormLabelClass}>
                Condition
              </label>
              <Select<ToolConditionKey>
                id={conditionId}
                value={condition}
                onChange={setCondition}
                options={TOOL_CONDITION_OPTIONS}
              />
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className={toolFormLabelClass}>Notes</span>
            <textarea
              maxLength={TOOL_DESCRIPTION_MAX_LENGTH}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className={toolFormFieldClass}
              placeholder="Pickup details, what's included…"
            />
          </label>

          {formError ? (
            <p className="text-sm text-negative" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? TOOL_BOARD_COPY.adding : TOOL_BOARD_COPY.addToBoard}
          </Button>
        </form>
      </Panel>
    </dialog>
  );
}
