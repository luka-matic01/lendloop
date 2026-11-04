import { TOOLS_COPY } from "../constants/copy";
import type { MyTool } from "../types/tools";

export type ListingLockInput = {
  activeLoan?: MyTool["activeLoan"];
  upcomingReservationCount?: number;
};

export function listingManagementLock(input: ListingLockInput): {
  locked: boolean;
  tooltip: string | undefined;
} {
  const onLoan = input.activeLoan?.started === true;
  const reservationCount = input.upcomingReservationCount ?? 0;
  const locked = onLoan || reservationCount > 0;
  const tooltip = onLoan
    ? TOOLS_COPY.listingLockedActiveLoan
    : locked
      ? TOOLS_COPY.listingLockedReservation
      : undefined;

  return { locked, tooltip };
}
