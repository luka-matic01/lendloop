"use client";

import { useEffect, useId, useRef } from "react";

import {
  MODAL_BUTTON_LABEL_TRUNCATE_CLASS,
  MODAL_DIALOG_CLASS,
  MODAL_PANEL_CLASS,
  syncModalDialogOpen,
} from "@/lib/modal-dialog";
import { cn } from "@/lib/utils";

import { Button } from "./Button";
import { ModalTitle } from "./ModalTitle";
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
      <Panel className={cn(MODAL_PANEL_CLASS, "max-w-md")}>
        <ModalTitle id={titleId} title={title} size="confirm" />
        <p id={descriptionId} className="mt-2 text-sm text-ink-muted">
          {description}
        </p>
        <div className="mt-6 flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={confirming}
            className="shrink-0"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={confirming}
            className="min-w-0 max-w-full overflow-hidden sm:max-w-xs"
            title={confirmLabel}
            onClick={onConfirm}
          >
            <span className={MODAL_BUTTON_LABEL_TRUNCATE_CLASS}>
              {confirmLabel}
            </span>
          </Button>
        </div>
      </Panel>
    </dialog>
  );
}
