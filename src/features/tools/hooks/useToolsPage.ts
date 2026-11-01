"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { useToast } from "@/components/ui";
import { convexErrorMessage } from "@/lib/convex-error-message";
import { useEnsureCurrentUser } from "@/features/account";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { TOOLS_COPY } from "../constants/copy";
import type { ToolCategoryKey } from "../constants/labels";
import type { BoardTool, MyTool } from "../types/tools";

type ListingConfirmRemove = {
  type: "remove";
  toolId: Id<"tools">;
  name: string;
};

type ListingConfirmAvailability = {
  type: "availability";
  tool: MyTool;
};

export type ListingConfirm = ListingConfirmRemove | ListingConfirmAvailability;

export function useToolsPage() {
  const toast = useToast();
  const { phase, errorMessage } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const [categoryFilter, setCategoryFilter] = useState<
    ToolCategoryKey | "all"
  >("all");
  const [listModalOpen, setListModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<MyTool | null>(null);
  const [listingConfirm, setListingConfirm] = useState<ListingConfirm | null>(
    null,
  );
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  const boardToolsQuery = useQuery(api.tools.listBoard, isReady ? {} : "skip");
  const myToolsQuery = useQuery(api.tools.listMine, isReady ? {} : "skip");

  const removeTool = useMutation(api.tools.remove);
  const setAvailability = useMutation(api.tools.setAvailability);

  const boardTools = useMemo(() => boardToolsQuery ?? [], [boardToolsQuery]);
  const myTools = useMemo(() => myToolsQuery ?? [], [myToolsQuery]);

  const filteredBoardTools = useMemo((): BoardTool[] => {
    if (boardToolsQuery === undefined) {
      return [];
    }
    if (categoryFilter === "all") {
      return boardToolsQuery;
    }
    return boardToolsQuery.filter((tool) => tool.category === categoryFilter);
  }, [boardToolsQuery, categoryFilter]);

  const neighborBoardTools = useMemo(
    (): BoardTool[] => filteredBoardTools.filter((tool) => !tool.isOwner),
    [filteredBoardTools],
  );

  const neighborTotalOnBoard = useMemo(
    () => boardTools.filter((tool) => !tool.isOwner).length,
    [boardTools],
  );

  const isLoading =
    !isReady ||
    boardToolsQuery === undefined ||
    myToolsQuery === undefined;

  const openListModal = useCallback(() => {
    setEditingTool(null);
    setListModalOpen(true);
  }, []);

  const openEditModal = useCallback(
    (tool: MyTool) => {
      if (tool.hasActiveLoan) {
        toast(TOOLS_COPY.listingLockedActiveLoan, "error");
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
    (tool: { _id: Id<"tools">; name: string; hasActiveLoan?: boolean }) => {
      if (tool.hasActiveLoan) {
        toast(TOOLS_COPY.listingLockedActiveLoan, "error");
        return;
      }
      setListingConfirm({
        type: "remove",
        toolId: tool._id,
        name: tool.name,
      });
    },
    [toast],
  );

  const requestToggleListingAvailability = useCallback(
    (tool: MyTool) => {
      if (!tool.isAvailable && tool.hasActiveLoan) {
        toast(TOOLS_COPY.putOnBoardBlockedActiveLoan, "error");
        return;
      }
      setListingConfirm({ type: "availability", tool });
    },
    [toast],
  );

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
    phase,
    errorMessage,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    listModalOpen,
    editingTool,
    toolFormModalOpen: listModalOpen || editingTool !== null,
    openListModal,
    openEditModal,
    closeToolFormModal,
    boardTools,
    myTools,
    filteredBoardTools,
    neighborBoardTools,
    neighborTotalOnBoard,
    listingConfirm,
    confirmSubmitting,
    requestRemoveListing,
    requestToggleListingAvailability,
    cancelListingConfirm,
    confirmListingAction,
  };
}
