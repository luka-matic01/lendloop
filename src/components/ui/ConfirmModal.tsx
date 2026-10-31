"use client";

import { useEffect, useId, useRef } from "react";

import { MODAL_DIALOG_CLASS, syncModalDialogOpen } from "@/lib/modal-dialog";

import { Button } from "./Button";
import { Panel } from "./Panel";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    syncModalDialogOpen(dialog, open);
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={MODAL_DIALOG_CLASS}
      onCancel={(event) => {
        event.preventDefault();
        if (!confirming) {
          onCancel();
        }
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !confirming) {
          onCancel();
        }
      }}
    >
      <Panel className="w-full max-w-md">
        <h2
          id={titleId}
          className="font-display text-2xl font-bold leading-snug text-balance text-ink"
        >
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-ink-muted">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={confirming}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button type="button" disabled={confirming} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </Panel>
    </dialog>
  );
}
