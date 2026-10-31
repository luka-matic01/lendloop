import { auth } from "@clerk/nextjs/server";
import { ArrowLeftRight, LogIn, UserPlus, Wrench } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

const iconClass = "size-4 shrink-0";
const actionRowClass = "flex flex-wrap items-center gap-3";

function HomeHeroAuthActionsFallback() {
  return (
    <div className={actionRowClass} aria-hidden>
      <span
        className={cn(
          buttonClassName({ variant: "primary" }),
          "pointer-events-none invisible select-none",
        )}
      >
        <UserPlus className={iconClass} aria-hidden />
        Sign up
      </span>
      <span
        className={cn(
          buttonClassName({ variant: "board-secondary" }),
          "pointer-events-none invisible select-none",
        )}
      >
        <LogIn className={iconClass} aria-hidden />
        Sign in
      </span>
    </div>
  );
}

async function HomeHeroAuthActionsContent() {
  const { isAuthenticated } = await auth();

  if (isAuthenticated) {
    return (
      <div className={actionRowClass}>
        <Link
          href={ROUTES.tools}
          className={cn(
            buttonClassName({ variant: "primary" }),
            "focus-visible:ring-offset-board",
          )}
        >
          <Wrench className={iconClass} aria-hidden />
          Tools
        </Link>
        <Link
          href={ROUTES.loans}
          className={cn(
            buttonClassName({ variant: "board-secondary" }),
            "focus-visible:ring-offset-board",
          )}
        >
          <ArrowLeftRight className={iconClass} aria-hidden />
          Loans
        </Link>
      </div>
    );
  }

  return (
    <div className={actionRowClass}>
      <Link
        href={ROUTES.signUp}
        className={cn(
          buttonClassName({ variant: "primary" }),
          "focus-visible:ring-offset-board",
        )}
      >
        <UserPlus className={iconClass} aria-hidden />
        Sign up
      </Link>
      <Link
        href={ROUTES.signIn}
        className={cn(
          buttonClassName({ variant: "board-secondary" }),
          "focus-visible:ring-offset-board",
        )}
      >
        <LogIn className={iconClass} aria-hidden />
        Sign in
      </Link>
    </div>
  );
}

export function HomeHeroAuthActions() {
  return (
    <Suspense fallback={<HomeHeroAuthActionsFallback />}>
      <HomeHeroAuthActionsContent />
    </Suspense>
  );
}
