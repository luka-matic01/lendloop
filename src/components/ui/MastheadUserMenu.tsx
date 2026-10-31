"use client";

import { UserButton } from "@clerk/nextjs";

const userButtonAppearance = {
  elements: {
    userButtonAvatarBox:
      "size-9 shrink-0 rounded-control border-2 border-on-board ring-0",
    userButtonTrigger:
      "shrink-0 rounded-control focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-board",
  },
} as const;

export function MastheadUserMenu() {
  return (
    <UserButton appearance={userButtonAppearance} />
  );
}
