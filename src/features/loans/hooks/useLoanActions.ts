"use client";

import { useMutation } from "convex/react";
import { useCallback, useState } from "react";

import { useToast } from "@/components/ui";
import { convexErrorMessage } from "@/lib/convex-error-message";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import {
  LOANS_COPY,
  type LoanReturnPerspective,
} from "../constants/copy";

export type MarkReturnedConfirm = {
  requestId: Id<"loanRequests">;
  toolName: string;
  perspective: LoanReturnPerspective;
};

export function useLoanActions() {
  const toast = useToast();
  const approveMut = useMutation(api.loanRequests.approve);
  const declineMut = useMutation(api.loanRequests.decline);
  const markReturnedMut = useMutation(api.loanRequests.markReturned);
  const setTrustedMut = useMutation(api.users.setTrustedLender);

  const [pendingId, setPendingId] = useState<Id<"loanRequests"> | null>(null);
  const [returnConfirm, setReturnConfirm] =
    useState<MarkReturnedConfirm | null>(null);

  const approve = useCallback(
    async (requestId: Id<"loanRequests">, toolName: string) => {
      setPendingId(requestId);
      try {
        await approveMut({ requestId });
        toast(LOANS_COPY.toastApproved(toolName));
      } catch (error) {
        toast(convexErrorMessage(error, "Could not approve"), "error");
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
        toast(convexErrorMessage(error, "Could not decline"), "error");
      } finally {
        setPendingId(null);
      }
    },
    [declineMut, toast],
  );

  const requestMarkReturned = useCallback(
    (
      requestId: Id<"loanRequests">,
      toolName: string,
      perspective: LoanReturnPerspective,
    ) => {
      setReturnConfirm({ requestId, toolName, perspective });
    },
    [],
  );

  const cancelMarkReturned = useCallback(() => {
    if (pendingId !== null) {
      return;
    }
    setReturnConfirm(null);
  }, [pendingId]);

  const confirmMarkReturned = useCallback(async () => {
    if (!returnConfirm) {
      return;
    }
    const { requestId, toolName } = returnConfirm;
    setPendingId(requestId);
    try {
      await markReturnedMut({ requestId });
      toast(LOANS_COPY.toastReturned(toolName));
      setReturnConfirm(null);
    } catch (error) {
      toast(convexErrorMessage(error, "Could not mark returned"), "error");
    } finally {
      setPendingId(null);
    }
  }, [markReturnedMut, returnConfirm, toast]);

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
        toast(convexErrorMessage(error, "Could not update lender"), "error");
      }
    },
    [setTrustedMut, toast],
  );

  return {
    pendingId,
    returnConfirm,
    approve,
    decline,
    requestMarkReturned,
    confirmMarkReturned,
    cancelMarkReturned,
    setTrustedLender,
  };
}
