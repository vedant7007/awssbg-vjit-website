"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";

const LINKS = [
  { label: "Overview", href: routes.console },
  { label: "Tasks", href: routes.consoleTasks },
  { label: "Profile", href: routes.consoleProfile },
  { label: "Settings", href: routes.consoleSettings },
];

export function ConsoleNav() {
  const path = usePathname();
  return (
    <nav aria-label="Console" className="flex items-center gap-1">
      {LINKS.map((l) => {
        const active =
          l.href === routes.console ? path === l.href : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-3.5",
              active
                ? "bg-orange/15 text-orange"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
