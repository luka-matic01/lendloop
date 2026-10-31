"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: ROUTES.tools, label: "Tools" },
  { href: ROUTES.loans, label: "Loans" },
] as const;

export function MastheadNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App"
      className="flex flex-nowrap items-center gap-1 sm:gap-2"
    >
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-control px-2.5 py-1.5 text-sm font-semibold transition-colors sm:px-3 sm:text-base",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-board",
              active
                ? "bg-on-board/15 text-on-board"
                : "text-on-board/80 hover:bg-on-board/10 hover:text-on-board",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
