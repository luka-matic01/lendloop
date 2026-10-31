export const LOAN_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
  returned: "Returned",
} as const;

export const LOANS_COPY = {
  homeLoansTitle: "Loans",
  homeLoansSignedInDescription:
    "Requests on your tools and borrows you have in flight.",
  homeIncomingPreview: "Needs your OK",
  homeMyRequestsPreview: "Your borrows",
  homeEmptyLoans: "No active loan activity yet.",
  seeAllLoans: "Open loans",
  pageTitle: "Loans",
  pageDescription:
    "Incoming requests on your tools, your borrows, and loan activity.",
  incomingHeading: "Incoming requests",
  myRequestsHeading: "My requests",
  allLoansHeading: "All loans",
  emptyIncoming: "No one has requested your tools yet.",
  emptyMyRequests: "You have not requested any tools yet.",
  emptyAllLoans: "No loans on the platform yet.",
  loadErrorTitle: "Could not open loans",
  approve: "Approve",
  decline: "Decline",
  markReturned: "Mark returned",
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
