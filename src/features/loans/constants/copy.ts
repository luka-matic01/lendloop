export const LOAN_STATUS_LABELS = {
  pending: "Pending",
  approved: "Out on loan",
  declined: "Declined",
  returned: "Returned",
} as const;

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
    "Incoming requests on your tools, your borrows, and loan activity.",
  incomingHeading: "On your tools",
  myRequestsHeading: "Your borrows",
  allLoansHeading: "All loans",
  emptyIncoming: "No active requests or loans on your tools.",
  emptyMyRequests: "You have no active borrows or requests.",
  emptyAllLoans: "No loans on the platform yet.",
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
  requestedBy(name: string) {
    return `Requested by ${name}`;
  },
  borrowedBy(name: string) {
    return `Borrowed by ${name}`;
  },
  markTrusted: "Mark trusted lender",
  removeTrusted: "Remove trusted",
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
