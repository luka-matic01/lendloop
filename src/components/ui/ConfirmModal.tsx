"use client";

import { useId } from "react";

import { Modal, ModalActions, ModalHeading } from "./Modal";

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
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="confirm"
      dismissible={!confirming}
      describedBy={descriptionId}
    >
      <ModalHeading title={title} />
      <p id={descriptionId} className="mt-2 text-sm text-ink-muted">
        {description}
      </p>
      <ModalActions
        className="mt-6"
        cancelLabel={cancelLabel}
        cancelDisabled={confirming}
        onCancel={onCancel}
        primaryLabel={confirmLabel}
        primaryDisabled={confirming}
        onPrimary={onConfirm}
      />
    </Modal>
  );
}
