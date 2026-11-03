import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export type LoanNotifyEvent = "request.created" | "request.status_changed";
export type NotifyRole = "borrower" | "lender";

export function scheduleLoanNotification(
  ctx: MutationCtx,
  args: {
    loanRequestId: Id<"loanRequests">;
    event: LoanNotifyEvent;
    notifyRole: NotifyRole;
  },
) {
  void ctx.scheduler.runAfter(0, internal.automation.notifyN8n, args);
}

export function scheduleNotifyOtherParty(
  ctx: MutationCtx,
  args: {
    loanRequestId: Id<"loanRequests">;
    actorUserId: Id<"users">;
    lenderId: Id<"users">;
    borrowerId: Id<"users">;
  },
) {
  const notifyRole: NotifyRole =
    args.actorUserId === args.lenderId ? "borrower" : "lender";
  scheduleLoanNotification(ctx, {
    loanRequestId: args.loanRequestId,
    event: "request.status_changed",
    notifyRole,
  });
}
