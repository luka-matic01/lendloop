"use client";

import { useMutation, usePaginatedQuery } from "convex/react";
import { useCallback, useState } from "react";

import { useToast } from "@/components/ui";
import { convexErrorMessage } from "@/lib/convexErrorMessage";
import { useEnsureCurrentUser } from "@/features/account";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { TOOLS_COPY } from "../constants/copy";
import type { ToolCategoryKey } from "../constants/labels";
import {
  BOARD_PAGE_SIZE,
  MY_LISTINGS_PAGE_SIZE,
} from "../constants/pagination";
import type { BoardTool, MyTool } from "../types/tools";
import { useStaleTabResults } from "./useStaleTabResults";

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

  const boardCategory =
    categoryFilter === "all" ? undefined : categoryFilter;

  const {
    results: boardTools,
    status: boardStatus,
    loadMore: loadMoreBoard,
  } = usePaginatedQuery(
    api.tools.listBoard,
    isReady ? { category: boardCategory } : "skip",
    { initialNumItems: BOARD_PAGE_SIZE },
  );

  const {
    results: myTools,
    status: myListingsStatus,
    loadMore: loadMoreMyListings,
  } = usePaginatedQuery(
    api.tools.listMine,
    isReady ? {} : "skip",
    { initialNumItems: MY_LISTINGS_PAGE_SIZE },
  );

  const {
    displayItems: neighborBoardTools,
    isInitialLoad: neighborBoardLoading,
    isRefreshing: neighborBoardRefreshing,
    isSyncingPagination: neighborBoardSyncingPagination,
  } = useStaleTabResults(
    categoryFilter,
    boardStatus,
    boardTools,
    loadMoreBoard,
    BOARD_PAGE_SIZE,
  );

  const removeTool = useMutation(api.tools.remove);
  const setAvailability = useMutation(api.tools.setAvailability);

  const boardIsEmpty =
    boardStatus !== "LoadingFirstPage" &&
    boardTools.length === 0 &&
    boardStatus === "Exhausted";

  const isPageBootstrapping =
    !isReady || myListingsStatus === "LoadingFirstPage";

  const boardCanLoadMore =
    !neighborBoardRefreshing &&
    !neighborBoardSyncingPagination &&
    boardStatus === "CanLoadMore";
  const boardLoadingMore = boardStatus === "LoadingMore";
  const myListingsCanLoadMore = myListingsStatus === "CanLoadMore";
  const myListingsLoadingMore = myListingsStatus === "LoadingMore";

  const openListModal = useCallback(() => {
    setEditingTool(null);
    setListModalOpen(true);
  }, []);

  const openEditModal = useCallback(
    (tool: MyTool) => {
      if (tool.hasActiveLoan) {
        toast(
          tool.activeLoan?.started
            ? TOOLS_COPY.listingLockedActiveLoan
            : TOOLS_COPY.listingLockedReservation,
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
      const locked =
        tool.hasActiveLoan === true ||
        (tool.upcomingReservationCount ?? 0) > 0;
      if (locked) {
        toast(
          tool.activeLoan?.started
            ? TOOLS_COPY.listingLockedActiveLoan
            : TOOLS_COPY.listingLockedReservation,
          "error",
        );
        return;
      }
      setListingConfirm({
        type: "remove",
        toolId: tool._id,
        name: tool.name,
        ownerName:
          tool.isOwner === false ? tool.ownerName : undefined,
      });
    },
    [toast],
  );

  const requestToggleListingAvailability = useCallback(
    (tool: MyTool) => {
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

  const loadMoreBoardPage = useCallback(() => {
    loadMoreBoard(BOARD_PAGE_SIZE);
  }, [loadMoreBoard]);

  const loadMoreMyListingsPage = useCallback(() => {
    loadMoreMyListings(MY_LISTINGS_PAGE_SIZE);
  }, [loadMoreMyListings]);

  return {
    phase,
    errorMessage,
    isPageBootstrapping,
    neighborBoardLoading,
    neighborBoardRefreshing,
    neighborBoardSyncingPagination,
    categoryFilter,
    setCategoryFilter,
    listModalOpen,
    editingTool,
    toolFormModalOpen: listModalOpen || editingTool !== null,
    openListModal,
    openEditModal,
    closeToolFormModal,
    boardIsEmpty,
    myTools,
    neighborBoardTools,
    neighborTotalOnBoard: neighborBoardTools.length,
    boardCanLoadMore,
    boardLoadingMore,
    loadMoreBoardPage,
    myListingsCanLoadMore,
    myListingsLoadingMore,
    loadMoreMyListingsPage,
    listingConfirm,
    confirmSubmitting,
    requestRemoveListing,
    requestToggleListingAvailability,
    cancelListingConfirm,
    confirmListingAction,
  };
}
