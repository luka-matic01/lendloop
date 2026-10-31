"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { useEnsureCurrentUser } from "@/features/account";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import type { ToolCategoryKey } from "../constants/labels";
import type { BoardTool, MyTool } from "../types/tools";

export function useToolBoard() {
  const { phase, errorMessage } = useEnsureCurrentUser();
  const isReady = phase === "ready";

  const [categoryFilter, setCategoryFilter] = useState<
    ToolCategoryKey | "all"
  >("all");
  const [listModalOpen, setListModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const openListModal = useCallback(() => setListModalOpen(true), []);
  const closeListModal = useCallback(() => setListModalOpen(false), []);

  const removeBoardTool = useCallback(
    async (toolId: Id<"tools">) => {
      setActionError(null);
      try {
        await removeTool({ toolId });
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Could not remove tool",
        );
      }
    },
    [removeTool],
  );

  const toggleListingAvailability = useCallback(
    async (tool: MyTool) => {
      setActionError(null);
      try {
        await setAvailability({
          toolId: tool._id,
          isAvailable: !tool.isAvailable,
        });
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Could not update availability",
        );
      }
    },
    [setAvailability],
  );

  return {
    phase,
    errorMessage,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    listModalOpen,
    openListModal,
    closeListModal,
    boardTools,
    myTools,
    filteredBoardTools,
    neighborBoardTools,
    neighborTotalOnBoard,
    myLiveOnBoardCount,
    actionError,
    removeBoardTool,
    toggleListingAvailability,
  };
}
