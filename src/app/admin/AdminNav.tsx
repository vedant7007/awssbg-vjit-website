"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";

const LINKS = [
  { label: "Home", href: routes.admin },
  { label: "Tasks", href: routes.adminTasks },
  { label: "Members", href: routes.adminMembers },
  { label: "Events", href: routes.adminEvents },
  { label: "Projects", href: routes.adminProjects },
  { label: "Roadmap", href: routes.adminRoadmap },
  { label: "Applications", href: routes.adminApplications },
  { label: "Check-in", href: routes.adminCheckin },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="flex items-center gap-0.5 overflow-x-auto"
    >
      {LINKS.map((l) => {
        const active =
          l.href === routes.admin ? path === l.href : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-orange text-ink"
                : "text-paper/70 hover:text-paper hover:bg-paper/10",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
