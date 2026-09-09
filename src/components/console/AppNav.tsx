"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  "rounded-full px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-3.5";
const activePill = "bg-orange/15 text-orange";
const idlePill =
  "text-muted-foreground hover:text-foreground hover:bg-foreground/5";

/**
 * The single authenticated nav. Everyone gets the primary links; admins also
 * get the Manage areas. Role differences are content, not a separate app.
 *
 * On phones the full bar doesn't fit — it used to scroll sideways, which hid
 * Manage entirely behind a swipe nobody discovers. Below `sm` the whole thing
 * collapses into one menu that lists every destination.
 */
export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  const isActive = (href: string) =>
    href === routes.console ? path === href : path.startsWith(href);
  const inManage = MANAGE.some((m) => path.startsWith(m.href));

  const current =
    MANAGE.find((m) => path.startsWith(m.href))?.label ??
    [...PRIMARY].reverse().find((l) => isActive(l.href))?.label ??
    "Menu";

  return (
    <>
      {/* Phones: one menu, everything reachable, nothing off-screen. */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open navigation"
          className={cn(
            pill,
            "inline-flex min-h-9 items-center gap-1.5 outline-none sm:hidden",
            activePill,
          )}
        >
          <Menu className="size-4" />
          {current}
          <ChevronDown className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {PRIMARY.map((l) => (
            <DropdownMenuItem key={l.href} asChild>
              <Link href={l.href}>{l.label}</Link>
            </DropdownMenuItem>
          ))}
          {isAdmin ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <ShieldCheck className="size-3.5" />
                Manage
              </DropdownMenuLabel>
              {MANAGE.map((m) => (
                <DropdownMenuItem key={m.href} asChild>
                  <Link href={m.href}>{m.label}</Link>
                </DropdownMenuItem>
              ))}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tablet and up: the full bar. */}
      <nav aria-label="Console" className="hidden items-center gap-1 sm:flex">
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
                "inline-flex min-h-9 items-center gap-1 outline-none",
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
    </>
  );
}
