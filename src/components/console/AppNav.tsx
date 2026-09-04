"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const PRIMARY = [
  { label: "Overview", href: routes.console },
  { label: "Tasks", href: routes.consoleTasks },
  { label: "Profile", href: routes.consoleProfile },
  { label: "Settings", href: routes.consoleSettings },
];

/** Admin-only management areas, tucked behind one "Manage" menu so the bar
 * stays clean for everyone. */
const MANAGE = [
  { label: "Members", href: routes.adminMembers },
  { label: "Applications", href: routes.adminApplications },
  { label: "Events", href: routes.adminEvents },
  { label: "Projects", href: routes.adminProjects },
  { label: "Roadmap", href: routes.adminRoadmap },
  { label: "Photo booth", href: routes.adminBooth },
  { label: "Check-in", href: routes.adminCheckin },
];

const pill =
  "rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-3.5";
const activePill = "bg-orange/15 text-orange";
const idlePill =
  "text-muted-foreground hover:text-foreground hover:bg-foreground/5";

/** The single authenticated nav. Everyone gets the primary links; admins also
 * get the Manage menu. Role differences are content, not a separate app. */
export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  const isActive = (href: string) =>
    href === routes.console ? path === href : path.startsWith(href);
  const inManage = MANAGE.some((m) => path.startsWith(m.href));

  return (
    <nav
      aria-label="Console"
      className="flex items-center gap-1 overflow-x-auto"
    >
      {PRIMARY.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(pill, isActive(l.href) ? activePill : idlePill)}
        >
          {l.label}
        </Link>
      ))}

      {isAdmin ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              pill,
              "inline-flex items-center gap-1 outline-none",
              inManage ? activePill : idlePill,
            )}
          >
            <ShieldCheck className="size-3.5" />
            Manage
            <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {MANAGE.map((m) => (
              <DropdownMenuItem key={m.href} asChild>
                <Link href={m.href}>{m.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </nav>
  );
}
