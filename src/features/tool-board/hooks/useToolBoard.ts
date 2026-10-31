"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { useToast } from "@/components/ui";
import { useEnsureCurrentUser } from "@/features/account";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { TOOL_BOARD_COPY } from "../constants/copy";
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

export function useToolBoard() {
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

  const boardTools = boardToolsQuery ?? [];
  const myTools = myToolsQuery ?? [];

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

  const myLiveOnBoardCount = useMemo(
    () => myTools.filter((tool) => tool.isAvailable).length,
    [myTools],
  );

  const isLoading =
    !isReady ||
    boardToolsQuery === undefined ||
    myToolsQuery === undefined;

  const openListModal = useCallback(() => {
    setEditingTool(null);
    setListModalOpen(true);
  }, []);

  const openEditModal = useCallback((tool: MyTool) => {
    setListModalOpen(false);
    setEditingTool(tool);
  }, []);

  const closeToolFormModal = useCallback(() => {
    setListModalOpen(false);
    setEditingTool(null);
  }, []);

  const requestRemoveListing = useCallback(
    (tool: { _id: Id<"tools">; name: string }) => {
      setListingConfirm({
        type: "remove",
        toolId: tool._id,
        name: tool.name,
      });
    },
    [],
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
        toast(TOOL_BOARD_COPY.toastListingRemoved(listingConfirm.name));
      } else {
        const { tool } = listingConfirm;
        await setAvailability({
          toolId: tool._id,
          isAvailable: !tool.isAvailable,
        });
        toast(
          tool.isAvailable
            ? TOOL_BOARD_COPY.toastListingPaused(tool.name)
            : TOOL_BOARD_COPY.toastListingOnBoard(tool.name),
        );
      }
      setListingConfirm(null);
    } catch (error) {
      const fallback =
        listingConfirm.type === "remove"
          ? "Could not remove tool"
          : "Could not update availability";
      toast(
        error instanceof Error ? error.message : fallback,
        "error",
      );
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
    myLiveOnBoardCount,
    listingConfirm,
    confirmSubmitting,
    requestRemoveListing,
    requestToggleListingAvailability,
    cancelListingConfirm,
    confirmListingAction,
  };
}
