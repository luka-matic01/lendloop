import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeftRight,
  LogIn,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { buttonClassName, type ButtonVariant } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

const iconClass = "size-4 shrink-0";
const actionRowClass = "flex flex-wrap items-center gap-3";

type HeroAuthAction = {
  href: string;
  variant: ButtonVariant;
  icon: LucideIcon;
  label: string;
};

const signedOutActions: HeroAuthAction[] = [
  { href: ROUTES.signIn, variant: "primary", icon: LogIn, label: "Sign in" },
  {
    href: ROUTES.signUp,
    variant: "board-secondary",
    icon: UserPlus,
    label: "Sign up",
  },
];

const signedInActions: HeroAuthAction[] = [
  { href: ROUTES.tools, variant: "primary", icon: Wrench, label: "Tools" },
  {
    href: ROUTES.loans,
    variant: "board-secondary",
    icon: ArrowLeftRight,
    label: "Loans",
  },
];

function HeroAuthActionRow({
  actions,
  placeholder = false,
}: {
  actions: HeroAuthAction[];
  placeholder?: boolean;
}) {
  return (
    <div
      className={actionRowClass}
      {...(placeholder ? { "aria-hidden": true } : {})}
    >
      {actions.map(({ href, variant, icon: Icon, label }) => {
        const className = cn(
          buttonClassName({ variant }),
          placeholder
            ? "pointer-events-none invisible select-none"
            : "focus-visible:ring-offset-board",
        );

        if (placeholder) {
          return (
            <span key={label} className={className}>
              <Icon className={iconClass} aria-hidden />
              {label}
            </span>
          );
        }

        return (
          <Link key={href} href={href} className={className}>
            <Icon className={iconClass} aria-hidden />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

function HomeHeroAuthActionsFallback() {
  return <HeroAuthActionRow actions={signedOutActions} placeholder />;
}

async function HomeHeroAuthActionsContent() {
  const { isAuthenticated } = await auth();

  return (
    <HeroAuthActionRow
      actions={isAuthenticated ? signedInActions : signedOutActions}
    />
  );
}

export function HomeHeroAuthActions() {
  return (
    <Suspense fallback={<HomeHeroAuthActionsFallback />}>
      <HomeHeroAuthActionsContent />
    </Suspense>
  );
}
