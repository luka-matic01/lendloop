"use client";

import { useMutation } from "convex/react";
import { useCallback, useState } from "react";

import { useToast } from "@/components/ui";
import { convexErrorMessage } from "@/lib/convexErrorMessage";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { TOOLS_COPY } from "../constants/copy";
import type { MyTool } from "../types/tools";
import { getMyListingPresentation } from "../utils/getMyListingPresentation";
import { listingManagementLock } from "../utils/listingManagementLock";

type ListingConfirmRemove = {
  type: "remove";
  toolId: Id<"tools">;
  name: string;
  ownerName?: string;
};

type ListingConfirmAvailability = {
  type: "availability";
  tool: MyTool;
};

export type ListingConfirm = ListingConfirmRemove | ListingConfirmAvailability;

/** Enough for remove confirm UI; loan-lock fields optional (board rows omit them). */
export type ListingRemoveTarget = Pick<MyTool, "_id" | "name"> & {
  isOwner?: boolean;
  ownerName?: string;
  hasActiveLoan?: boolean;
  activeLoan?: MyTool["activeLoan"];
  upcomingReservationCount?: number;
};

export function useListingActions() {
  const toast = useToast();

  const [listModalOpen, setListModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<MyTool | null>(null);
  const [listingConfirm, setListingConfirm] = useState<ListingConfirm | null>(
    null,
  );
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  const removeTool = useMutation(api.tools.remove);
  const setAvailability = useMutation(api.tools.setAvailability);

  const openListModal = useCallback(() => {
    setEditingTool(null);
    setListModalOpen(true);
  }, []);

  const openEditModal = useCallback(
    (tool: MyTool) => {
      const { editDisabled, editTooltip } = getMyListingPresentation(tool);
      if (editDisabled) {
        toast(
          editTooltip ?? TOOLS_COPY.listingLockedReservation,
          "error",
        );
        return;
      }
      setListModalOpen(false);
      setEditingTool(tool);
    },
    [toast],
  );

  const closeToolFormModal = useCallback(() => {
    setListModalOpen(false);
    setEditingTool(null);
  }, []);

  const requestRemoveListing = useCallback(
    (tool: ListingRemoveTarget) => {
      const { locked, tooltip } = listingManagementLock(tool);
      if (locked) {
        toast(tooltip ?? TOOLS_COPY.listingLockedReservation, "error");
        return;
      }
      setListingConfirm({
        type: "remove",
        toolId: tool._id,
        name: tool.name,
        ownerName: tool.isOwner === false ? tool.ownerName : undefined,
      });
    },
    [toast],
  );

  const requestToggleListingAvailability = useCallback((tool: MyTool) => {
    setListingConfirm({ type: "availability", tool });
  }, []);

  const cancelListingConfirm = useCallback(() => {
    if (confirmSubmitting) {
      return;
    }
    setListingConfirm(null);
  }, [confirmSubmitting]);

  const confirmListingAction = useCallback(async () => {
    if (!listingConfirm) {
      return;
    }
    setConfirmSubmitting(true);
    try {
      if (listingConfirm.type === "remove") {
        await removeTool({ toolId: listingConfirm.toolId });
        toast(TOOLS_COPY.toastListingRemoved(listingConfirm.name));
      } else {
        const { tool } = listingConfirm;
        await setAvailability({
          toolId: tool._id,
          isAvailable: !tool.isAvailable,
        });
        toast(
          tool.isAvailable
            ? TOOLS_COPY.toastListingPaused(tool.name)
            : TOOLS_COPY.toastListingOnBoard(tool.name),
        );
      }
      setListingConfirm(null);
    } catch (error) {
      const fallback =
        listingConfirm.type === "remove"
          ? "Could not remove tool"
          : "Could not update availability";
      toast(convexErrorMessage(error, fallback), "error");
    } finally {
      setConfirmSubmitting(false);
    }
  }, [listingConfirm, removeTool, setAvailability, toast]);

  return {
    listModalOpen,
    editingTool,
    toolFormModalOpen: listModalOpen || editingTool !== null,
    openListModal,
    openEditModal,
    closeToolFormModal,
    listingConfirm,
    confirmSubmitting,
    requestRemoveListing,
    requestToggleListingAvailability,
    cancelListingConfirm,
    confirmListingAction,
  };
}
