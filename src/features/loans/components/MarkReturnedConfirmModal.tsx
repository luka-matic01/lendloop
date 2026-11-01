"use client";

import { ConfirmModal } from "@/components/ui";

import {
  LOANS_COPY,
  markReturnedConfirmCopy,
} from "../constants/copy";
import type { useLoanActions } from "../hooks/useLoanActions";

type MarkReturnedConfirmModalProps = {
  loanActions: ReturnType<typeof useLoanActions>;
};

export function MarkReturnedConfirmModal({
  loanActions,
}: MarkReturnedConfirmModalProps) {
  const {
    returnConfirm,
    pendingId,
    confirmMarkReturned,
    cancelMarkReturned,
  } = loanActions;
  const copy = returnConfirm
    ? markReturnedConfirmCopy(returnConfirm.toolName, returnConfirm.perspective)
    : null;

  return (
    <ConfirmModal
      open={returnConfirm !== null}
      title={copy?.title ?? ""}
      description={copy?.description ?? ""}
      confirmLabel={copy?.confirmLabel ?? LOANS_COPY.confirmReturnAction}
      cancelLabel={LOANS_COPY.cancel}
      confirming={pendingId !== null && returnConfirm !== null}
      onConfirm={confirmMarkReturned}
      onCancel={cancelMarkReturned}
    />
  );
}
