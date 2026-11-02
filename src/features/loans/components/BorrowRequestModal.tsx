"use client";

import { useMutation } from "convex/react";
import { FormEvent, useId, useRef, useState } from "react";

import {
  fieldClass,
  fieldLabelClass,
  useToast,
} from "@/components/ui";
import { Modal, ModalActions, ModalHeader } from "@/components/ui/Modal";
import { convexErrorMessage } from "@/lib/convex-error-message";
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
  const errorId = useId();
  const startId = useId();
  const endId = useId();
  const startRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const createRequest = useMutation(api.loanRequests.create);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    <Modal
      open={open}
      onClose={onClose}
      size="form"
      dismissible={!submitting}
      initialFocusRef={startRef}
      describedBy={formError ? errorId : undefined}
    >
      <ModalHeader
        title={LOANS_COPY.borrowModalTitle(toolName)}
        closeDisabled={submitting}
        onClose={onClose}
      />

      <form
        key={`${open}-${toolId ?? "none"}`}
        className="mt-6 space-y-4"
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

        <ModalActions
          cancelLabel={LOANS_COPY.cancel}
          cancelDisabled={submitting}
          onCancel={onClose}
          primaryType="submit"
          primaryDisabled={submitting || !toolId}
          primaryLabel={
            submitting ? LOANS_COPY.borrowSubmitting : LOANS_COPY.borrowSubmitAction
          }
          primaryTitle={LOANS_COPY.borrowSubmit}
        />
      </form>
    </Modal>
  );
}
