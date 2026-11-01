"use client";

import { ConfirmModal } from "@/components/ui";

import { LOANS_COPY, trustedLenderConfirmCopy } from "../constants/copy";
import type { useLoanActions } from "../hooks/useLoanActions";

type TrustedLenderConfirmModalProps = {
  loanActions: ReturnType<typeof useLoanActions>;
};

export function TrustedLenderConfirmModal({
  loanActions,
}: TrustedLenderConfirmModalProps) {
  const {
    trustedConfirm,
    pendingTrustedUserId,
    confirmTrustedLenderChange,
    cancelTrustedLenderChange,
  } = loanActions;

  const copy = trustedConfirm
    ? trustedLenderConfirmCopy(trustedConfirm.name, trustedConfirm.grantTrust)
    : null;

  return (
    <ConfirmModal
      open={trustedConfirm !== null}
      title={copy?.title ?? ""}
      description={copy?.description ?? ""}
      confirmLabel={copy?.confirmLabel ?? LOANS_COPY.markTrusted}
      cancelLabel={LOANS_COPY.cancel}
      confirming={
        pendingTrustedUserId !== null && trustedConfirm !== null
      }
      onConfirm={confirmTrustedLenderChange}
      onCancel={cancelTrustedLenderChange}
    />
  );
}
