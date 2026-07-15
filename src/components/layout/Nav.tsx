"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/lib/constants/nav";
import { routes } from "@/lib/constants/routes";
import { initials } from "@/lib/utils/format";
import { useUser, signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { LogoMark } from "@/components/brand/LogoMark";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Site header. Transparent over the landing hero, then solid after 40px of
 * scroll. Auth state here is UI-only (label + avatar); route protection is
 * enforced server-side.
 */
export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  return (
    <header className="fixed inset-x-0 top-4 z-40 px-3 md:px-5">
      <div className="relative mx-auto flex max-w-[1320px] items-center justify-between gap-3">
        {/* Left corner: logo, on its own. */}
        <TransitionLink
          href={routes.home}
          className="glass focus-visible:ring-ring flex shrink-0 items-center gap-2 rounded-full py-2 pr-3.5 pl-2.5 focus-visible:ring-2 focus-visible:outline-none"
        >
          <LogoMark id="site-logo-mark" className="size-6 shrink-0" />
          <span className="font-pixel text-[0.58rem] leading-none tracking-tight">
            AWS<span className="text-orange">SBG</span>
          </span>
        </TransitionLink>

        {/* Centre: glass pill with only the sections. */}
        <nav
          aria-label="Primary"
          className="glass absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full p-1.5 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <TransitionLink
                key={link.href}
                href={link.href}
                className={cn(
                  "font-display focus-visible:ring-ring rounded-full px-4 py-1.5 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "bg-orange/15 text-orange ring-orange/30 shadow-[0_0_20px_-3px_rgba(255,153,0,0.65)] ring-1"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
                )}
              >
                {link.label}
              </TransitionLink>
            );
          })}
        </nav>

        {/* Right corner: theme toggle + sign in, on their own. */}
        <div className="glass flex shrink-0 items-center gap-0.5 rounded-full p-1">
          <ThemeToggle />

          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
                  aria-label="Account menu"
                >
                  <Avatar className="size-9">
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt="" />
                    ) : null}
                    <AvatarFallback>
                      {initials(user.displayName ?? user.email ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="truncate">
                  {user.displayName ?? user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <TransitionLink href={routes.console}>
                    <LayoutDashboard className="size-4" />
                    Console
                  </TransitionLink>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    signOut().catch(() => undefined);
                  }}
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size="sm"
              className="hidden rounded-full md:inline-flex"
            >
              <TransitionLink href={routes.signin}>Sign in</TransitionLink>
            </Button>
          )}

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <SheetClose asChild key={link.href}>
              <TransitionLink
                href={link.href}
                className="hover:bg-accent rounded-sm px-3 py-2.5 text-base font-medium"
              >
                {link.label}
              </TransitionLink>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <TransitionLink
              href={routes.signin}
              className="bg-primary text-primary-foreground mt-4 rounded-sm px-3 py-2.5 text-center text-base font-medium"
            >
              Sign in
            </TransitionLink>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
