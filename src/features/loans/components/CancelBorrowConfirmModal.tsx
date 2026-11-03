"use client";

import { ConfirmModal } from "@/components/ui";

import { LOANS_COPY } from "../constants/copy";
import type { useLoanActions } from "../hooks/useLoanActions";

type CancelBorrowConfirmModalProps = {
  loanActions: ReturnType<typeof useLoanActions>;
};

export function CancelBorrowConfirmModal({
  loanActions,
}: CancelBorrowConfirmModalProps) {
  const {
    cancelConfirm,
    pendingId,
    confirmCancelBorrow,
    cancelCancelBorrow,
  } = loanActions;

  const confirmCopy =
    cancelConfirm?.kind === "pending"
      ? {
          title: LOANS_COPY.confirmCancelRequestTitle(cancelConfirm.toolName),
          description: LOANS_COPY.confirmCancelRequestDescription,
          confirmLabel: LOANS_COPY.confirmCancelRequestAction,
        }
      : cancelConfirm
        ? {
            title: LOANS_COPY.confirmCancelBorrowTitle(cancelConfirm.toolName),
            description: LOANS_COPY.confirmCancelBorrowDescription,
            confirmLabel: LOANS_COPY.confirmCancelBorrowAction,
          }
        : null;

  return (
    <ConfirmModal
      open={cancelConfirm !== null}
      title={confirmCopy?.title ?? ""}
      description={confirmCopy?.description ?? ""}
      confirmLabel={confirmCopy?.confirmLabel ?? ""}
      cancelLabel={LOANS_COPY.cancel}
      confirming={pendingId !== null && cancelConfirm !== null}
      onConfirm={confirmCancelBorrow}
      onCancel={cancelCancelBorrow}
    />
  );
}
