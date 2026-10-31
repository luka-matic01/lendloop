"use client";

import { useMutation } from "convex/react";
import { useCallback, useState } from "react";

import { useToast } from "@/components/ui";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { LOANS_COPY } from "../constants/copy";

export function useLoanActions() {
  const toast = useToast();
  const approveMut = useMutation(api.loanRequests.approve);
  const declineMut = useMutation(api.loanRequests.decline);
  const markReturnedMut = useMutation(api.loanRequests.markReturned);
  const setTrustedMut = useMutation(api.users.setTrustedLender);

  const [pendingId, setPendingId] = useState<Id<"loanRequests"> | null>(null);

  const approve = useCallback(
    async (requestId: Id<"loanRequests">, toolName: string) => {
      setPendingId(requestId);
      try {
        await approveMut({ requestId });
        toast(LOANS_COPY.toastApproved(toolName));
      } catch (error) {
        toast(
          error instanceof Error ? error.message : "Could not approve",
          "error",
        );
      } finally {
        setPendingId(null);
      }
    },
    [approveMut, toast],
  );

  const decline = useCallback(
    async (requestId: Id<"loanRequests">, toolName: string) => {
      setPendingId(requestId);
      try {
        await declineMut({ requestId });
        toast(LOANS_COPY.toastDeclined(toolName));
      } catch (error) {
        toast(
          error instanceof Error ? error.message : "Could not decline",
          "error",
        );
      } finally {
        setPendingId(null);
      }
    },
    [declineMut, toast],
  );

  const markReturned = useCallback(
    async (requestId: Id<"loanRequests">, toolName: string) => {
      setPendingId(requestId);
      try {
        await markReturnedMut({ requestId });
        toast(LOANS_COPY.toastReturned(toolName));
      } catch (error) {
        toast(
          error instanceof Error ? error.message : "Could not mark returned",
          "error",
        );
      } finally {
        setPendingId(null);
      }
    },
    [markReturnedMut, toast],
  );

  const setTrustedLender = useCallback(
    async (
      userId: Id<"users">,
      name: string,
      isTrustedLender: boolean,
    ) => {
      try {
        await setTrustedMut({ userId, isTrustedLender });
        toast(LOANS_COPY.toastTrustedUpdated(name, isTrustedLender));
      } catch (error) {
        toast(
          error instanceof Error ? error.message : "Could not update lender",
          "error",
        );
      }
    },
    [setTrustedMut, toast],
  );

  return {
    pendingId,
    approve,
    decline,
    markReturned,
    setTrustedLender,
  };
}
