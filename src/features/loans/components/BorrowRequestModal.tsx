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
  useToast,
} from "@/components/ui";
import { convexErrorMessage } from "@/lib/convex-error-message";
import { MODAL_DIALOG_CLASS, syncModalDialogOpen } from "@/lib/modal-dialog";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { LOANS_COPY } from "../constants/copy";

type BorrowRequestModalProps = {
  open: boolean;
  toolId: Id<"tools"> | null;
  toolName: string;
  onClose: () => void;
};

export function BorrowRequestModal({
  open,
  toolId,
  toolName,
  onClose,
}: BorrowRequestModalProps) {
  const titleId = useId();
  const errorId = useId();
  const startId = useId();
  const endId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const createRequest = useMutation(api.loanRequests.create);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    syncModalDialogOpen(dialog, open, {
      initialFocus: open ? startRef.current : null,
    });
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!toolId) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const startDate = String(data.get("startDate") ?? "").trim();
    const endDate = String(data.get("endDate") ?? "").trim();

    if (!startDate || !endDate) {
      setFormError("Choose start and return dates");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await createRequest({ toolId, startDate, endDate });
      toast(LOANS_COPY.toastRequestSent(toolName));
      onClose();
    } catch (error) {
      setFormError(convexErrorMessage(error, "Could not send request"));
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
      <Panel className="w-full max-w-lg">
        <div className="flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="min-w-0 pr-2 font-display text-3xl font-extrabold leading-tight text-ink [overflow-wrap:anywhere]"
          >
            {LOANS_COPY.borrowModalTitle(toolName)}
          </h2>
          <IconButton
            type="button"
            variant="ghost"
            className="text-ink-muted hover:text-ink"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="size-4 shrink-0" aria-hidden />
          </IconButton>
        </div>

        <form
          key={`${open}-${toolId ?? "none"}`}
          className="mt-6 space-y-4"
          aria-describedby={formError ? errorId : undefined}
          onSubmit={handleSubmit}
        >
          <label htmlFor={startId} className="block space-y-1.5">
            <span className={fieldLabelClass}>{LOANS_COPY.startDateLabel}</span>
            <input
              ref={startRef}
              id={startId}
              name="startDate"
              type="date"
              required
              className={fieldClass}
            />
          </label>
          <label htmlFor={endId} className="block space-y-1.5">
            <span className={fieldLabelClass}>{LOANS_COPY.endDateLabel}</span>
            <input
              id={endId}
              name="endDate"
              type="date"
              required
              className={fieldClass}
            />
          </label>

          {formError ? (
            <p id={errorId} className="text-sm text-negative" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting || !toolId} className="w-full">
            {submitting ? LOANS_COPY.borrowSubmitting : LOANS_COPY.borrowSubmit}
          </Button>
        </form>
      </Panel>
    </dialog>
  );
}
