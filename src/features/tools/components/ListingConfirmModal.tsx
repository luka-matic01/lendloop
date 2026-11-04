"use client";

import { ConfirmModal } from "@/components/ui";

import { TOOLS_COPY } from "../constants/copy";
import type { useListingActions } from "../hooks/useListingActions";

type ListingConfirmModalProps = {
  listingActions: ReturnType<typeof useListingActions>;
};

function listingConfirmModalCopy(
  listingConfirm: NonNullable<
    ReturnType<typeof useListingActions>["listingConfirm"]
  >,
) {
  if (listingConfirm.type === "remove") {
    const { name, ownerName } = listingConfirm;
    return {
      title: TOOLS_COPY.confirmRemoveTitle(name),
      description: ownerName
        ? TOOLS_COPY.confirmRemoveNeighborDescription(ownerName)
        : TOOLS_COPY.confirmRemoveDescription,
      confirmLabel: TOOLS_COPY.removeListing,
    };
  }

  const { name } = listingConfirm.tool;
  const pausing = listingConfirm.tool.isAvailable;
  return {
    title: pausing
      ? TOOLS_COPY.confirmPauseTitle(name)
      : TOOLS_COPY.confirmPutOnBoardTitle(name),
    description: pausing
      ? TOOLS_COPY.confirmPauseDescription
      : TOOLS_COPY.confirmPutOnBoardDescription,
    confirmLabel: pausing ? TOOLS_COPY.pauseListing : TOOLS_COPY.putOnBoard,
  };
}

export function ListingConfirmModal({
  listingActions,
}: ListingConfirmModalProps) {
  const {
    listingConfirm,
    confirmSubmitting,
    confirmListingAction,
    cancelListingConfirm,
  } = listingActions;

  const confirmCopy = listingConfirm
    ? listingConfirmModalCopy(listingConfirm)
    : null;

  return (
    <ConfirmModal
      open={listingConfirm !== null}
      title={confirmCopy?.title ?? ""}
      description={confirmCopy?.description ?? ""}
      confirmLabel={confirmCopy?.confirmLabel ?? ""}
      cancelLabel={TOOLS_COPY.cancel}
      confirming={confirmSubmitting}
      onConfirm={confirmListingAction}
      onCancel={cancelListingConfirm}
    />
  );
}
