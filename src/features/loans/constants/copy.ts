export const LOAN_STATUS_LABELS = {
  pending: "Pending",
  approved: "Out on loan",
  declined: "Declined",
  returned: "Returned",
} as const;

export type LoanStatusLabelKey = keyof typeof LOAN_STATUS_LABELS;

/** Who is viewing the row — status copy is phrased for that side of the loan. */
export type LoanStatusPerspective = "incoming" | "mine" | "admin";

/** Lender vs borrower — used for mark-returned confirm copy. */
export type LoanReturnPerspective = "incoming" | "mine";

export function loanStatusLabel(
  status: LoanStatusLabelKey,
  perspective: LoanStatusPerspective,
): string {
  if (perspective === "mine") {
    if (status === "approved") {
      return "Borrowing";
    }
    if (status === "pending") {
      return "Awaiting approval";
    }
  }
  return LOAN_STATUS_LABELS[status];
}

export const LOANS_COPY = {
  homeLoansTitle: "Loans",
  homeLoansSignedInDescription:
    "Requests on your tools, gear out with neighbors, and your borrows.",
  homeIncomingPreview: "On your tools",
  homeMyRequestsPreview: "Your borrows",
  homeEmptyLoans: "No active loan activity yet.",
  homeLoansSummary(incomingPending: number, incomingOut: number, myActive: number) {
    const parts: string[] = [];
    if (incomingPending > 0) {
      parts.push(
        incomingPending === 1
          ? "1 request needs your OK"
          : `${incomingPending} requests need your OK`,
      );
    }
    if (incomingOut > 0) {
      parts.push(
        incomingOut === 1
          ? "1 of your tools out"
          : `${incomingOut} of your tools out`,
      );
    }
    if (myActive > 0) {
      parts.push(
        myActive === 1
          ? "1 borrow in flight"
          : `${myActive} borrows in flight`,
      );
    }
    return parts.join(" · ");
  },
  seeAllLoans: "Open loans",
  pageTitle: "Loans",
  pageDescription:
    "Incoming requests on your tools and your borrows.",
  pageDescriptionAdmin:
    "Your requests and borrows, plus every active loan on the platform in All loans.",
  incomingHeading: "On your tools",
  myRequestsHeading: "Your borrows",
  allLoansHeading: "All loans",
  emptyIncoming: "No active requests or loans on your tools.",
  emptyMyRequests: "You have no active borrows or requests.",
  emptyAllLoansOpen: "No active loans on the platform right now.",
  pastLoansSectionTitle: "Past loans",
  showPastLoans(count: number) {
    return count === 1 ? "Show 1 past loan" : `Show ${count} past loans`;
  },
  hidePastLoans: "Hide past loans",
  pastLoansOnYourTools(count: number) {
    return count === 1
      ? "On your tools · 1 past"
      : `On your tools · ${count} past`;
  },
  pastLoansYourBorrows(count: number) {
    return count === 1
      ? "Your borrows · 1 past"
      : `Your borrows · ${count} past`;
  },
  sectionSummary(pendingCount: number, outCount: number) {
    const parts: string[] = [];
    if (pendingCount > 0) {
      parts.push(pendingCount === 1 ? "1 waiting for OK" : `${pendingCount} waiting for OK`);
    }
    if (outCount > 0) {
      parts.push(outCount === 1 ? "1 out on loan" : `${outCount} out on loan`);
    }
    return parts.join(" · ");
  },
  loadErrorTitle: "Could not open loans",
  approve: "Approve",
  decline: "Decline",
  markReturned: "Mark returned",
  cancel: "Cancel",
  confirmReturnAction: "Yes, mark returned",
  confirmReturnTitleIncoming(toolName: string) {
    return `Are you sure you got ${toolName} back?`;
  },
  confirmReturnTitleMine(toolName: string) {
    return `Are you sure you returned ${toolName}?`;
  },
  confirmReturnDescriptionIncoming:
    "This closes the loan and puts the tool back on the board.",
  confirmReturnDescriptionMine:
    "This tells the lender the tool is back.",
  requestedBy(name: string) {
    return `Requested by ${name}`;
  },
  borrowedBy(name: string) {
    return `Borrowed by ${name}`;
  },
  requestSentTo(name: string) {
    return `Request sent to ${name}`;
  },
  borrowedFrom(name: string) {
    return `Borrowed from ${name}`;
  },
  trustedLenderLabel: "Trusted lender",
  markTrusted: "Trust lender",
  removeTrusted: "Revoke trust",
  borrowModalTitle(toolName: string) {
    return `Borrow ${toolName}`;
  },
  borrowSubmit: "Send request",
  borrowSubmitting: "Sending…",
  startDateLabel: "Start date",
  endDateLabel: "Return date",
  toastRequestSent(toolName: string) {
    return `Request sent for ${toolName}`;
  },
  toastApproved(toolName: string) {
    return `Approved loan for ${toolName}`;
  },
  toastDeclined(toolName: string) {
    return `Declined request for ${toolName}`;
  },
  toastReturned(toolName: string) {
    return `${toolName} marked returned`;
  },
  toastTrustedUpdated(name: string, trusted: boolean) {
    return trusted ? `${name} marked as trusted lender` : `${name} is no longer trusted`;
  },
} as const;

export function trustedLenderConfirmCopy(name: string, grantTrust: boolean) {
  if (grantTrust) {
    return {
      title: `Trust ${name} as a lender?`,
      description:
        "Neighbors will see the trusted checkmark next to this lender on the board.",
      confirmLabel: LOANS_COPY.markTrusted,
    };
  }
  return {
    title: `Revoke trust for ${name}?`,
    description:
      "The trusted checkmark will no longer show on their listings.",
    confirmLabel: LOANS_COPY.removeTrusted,
  };
}

export function markReturnedConfirmCopy(
  toolName: string,
  perspective: LoanReturnPerspective,
) {
  if (perspective === "mine") {
    return {
      title: LOANS_COPY.confirmReturnTitleMine(toolName),
      description: LOANS_COPY.confirmReturnDescriptionMine,
      confirmLabel: LOANS_COPY.confirmReturnAction,
    };
  }
  return {
    title: LOANS_COPY.confirmReturnTitleIncoming(toolName),
    description: LOANS_COPY.confirmReturnDescriptionIncoming,
    confirmLabel: LOANS_COPY.confirmReturnAction,
  };
}
