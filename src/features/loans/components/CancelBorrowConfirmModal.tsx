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

  return (
    <ConfirmModal
      open={cancelConfirm !== null}
      title={
        cancelConfirm
          ? LOANS_COPY.confirmCancelBorrowTitle(cancelConfirm.toolName)
          : ""
      }
      description={LOANS_COPY.confirmCancelBorrowDescription}
      confirmLabel={LOANS_COPY.confirmCancelBorrowAction}
      cancelLabel={LOANS_COPY.cancel}
      confirming={pendingId !== null && cancelConfirm !== null}
      onConfirm={confirmCancelBorrow}
      onCancel={cancelCancelBorrow}
    />
  );
}
