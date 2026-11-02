"use client";

import { useMutation } from "convex/react";
import { FormEvent, useId, useRef, useState } from "react";

import {
  fieldClass,
  fieldLabelClass,
  Panel,
  useToast,
} from "@/components/ui";
import { Modal, ModalActions, ModalHeader } from "@/components/ui/Modal";
import { convexErrorMessage } from "@/lib/convexErrorMessage";
import {
  formatBorrowBookedNotice,
  utcTodayIso,
} from "@/lib/formatBorrowDue";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { LOANS_COPY } from "../constants/copy";

export type BookedBorrowRange = {
  startDate: string;
  endDate: string;
};

type BorrowRequestModalProps = {
  open: boolean;
  toolId: Id<"tools"> | null;
  toolName: string;
  loanOutUntil?: string;
  bookedRanges?: BookedBorrowRange[];
  onClose: () => void;
};

export function BorrowRequestModal({
  open,
  toolId,
  toolName,
  loanOutUntil,
  bookedRanges = [],
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
  const minBorrowDate = utcTodayIso();
  const bookedNotice = formatBorrowBookedNotice(bookedRanges, loanOutUntil);

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

    if (startDate < minBorrowDate) {
      setFormError("Start date cannot be in the past");
      return;
    }

    if (endDate < startDate) {
      setFormError("Return date must be on or after start date");
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
        {bookedNotice ? (
          <Panel tone="notice" className="!p-3 text-sm font-semibold text-ink">
            {bookedNotice}
          </Panel>
        ) : null}

        <label htmlFor={startId} className="block space-y-1.5">
          <span className={fieldLabelClass}>{LOANS_COPY.startDateLabel}</span>
          <input
            ref={startRef}
            id={startId}
            name="startDate"
            type="date"
            required
            min={minBorrowDate}
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
            min={minBorrowDate}
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
