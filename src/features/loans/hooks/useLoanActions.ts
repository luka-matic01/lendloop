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

export type CancelBorrowConfirm = {
  requestId: Id<"loanRequests">;
  toolName: string;
};

export type TrustedLenderConfirm = {
  userId: Id<"users">;
  name: string;
  grantTrust: boolean;
};

export function useLoanActions() {
  const toast = useToast();
  const approveMut = useMutation(api.loanRequests.approve);
  const declineMut = useMutation(api.loanRequests.decline);
  const markReturnedMut = useMutation(api.loanRequests.markReturned);
  const cancelApprovedMut = useMutation(api.loanRequests.cancelApproved);
  const setTrustedMut = useMutation(api.users.setTrustedLender);

  const [pendingId, setPendingId] = useState<Id<"loanRequests"> | null>(null);
  const [pendingTrustedUserId, setPendingTrustedUserId] =
    useState<Id<"users"> | null>(null);
  const [returnConfirm, setReturnConfirm] =
    useState<MarkReturnedConfirm | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<CancelBorrowConfirm | null>(
    null,
  );
  const [trustedConfirm, setTrustedConfirm] =
    useState<TrustedLenderConfirm | null>(null);

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

  const requestCancelBorrow = useCallback(
    (requestId: Id<"loanRequests">, toolName: string) => {
      setCancelConfirm({ requestId, toolName });
    },
    [],
  );

  const cancelCancelBorrow = useCallback(() => {
    if (pendingId !== null) {
      return;
    }
    setCancelConfirm(null);
  }, [pendingId]);

  const confirmCancelBorrow = useCallback(async () => {
    if (!cancelConfirm) {
      return;
    }
    const { requestId, toolName } = cancelConfirm;
    setPendingId(requestId);
    try {
      await cancelApprovedMut({ requestId });
      toast(LOANS_COPY.toastCancelled(toolName));
      setCancelConfirm(null);
    } catch (error) {
      toast(convexErrorMessage(error, "Could not cancel reservation"), "error");
    } finally {
      setPendingId(null);
    }
  }, [cancelApprovedMut, cancelConfirm, toast]);

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

  const requestTrustedLenderChange = useCallback(
    (userId: Id<"users">, name: string, grantTrust: boolean) => {
      setTrustedConfirm({ userId, name, grantTrust });
    },
    [],
  );

  const cancelTrustedLenderChange = useCallback(() => {
    if (pendingTrustedUserId !== null) {
      return;
    }
    setTrustedConfirm(null);
  }, [pendingTrustedUserId]);

  const confirmTrustedLenderChange = useCallback(async () => {
    if (!trustedConfirm) {
      return;
    }
    const { userId, name, grantTrust } = trustedConfirm;
    setPendingTrustedUserId(userId);
    try {
      await setTrustedMut({ userId, isTrustedLender: grantTrust });
      toast(LOANS_COPY.toastTrustedUpdated(name, grantTrust));
      setTrustedConfirm(null);
    } catch (error) {
      toast(convexErrorMessage(error, "Could not update lender"), "error");
    } finally {
      setPendingTrustedUserId(null);
    }
  }, [setTrustedMut, trustedConfirm, toast]);

  return {
    pendingId,
    pendingTrustedUserId,
    returnConfirm,
    cancelConfirm,
    trustedConfirm,
    approve,
    decline,
    requestMarkReturned,
    requestCancelBorrow,
    confirmMarkReturned,
    cancelMarkReturned,
    confirmCancelBorrow,
    cancelCancelBorrow,
    requestTrustedLenderChange,
    confirmTrustedLenderChange,
    cancelTrustedLenderChange,
  };
}
