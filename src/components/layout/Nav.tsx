"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/lib/constants/nav";
import { routes } from "@/lib/constants/routes";
import { initials } from "@/lib/utils/format";
import { useUser, signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
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
  const isLanding = pathname === routes.home;
  const [scrolled, setScrolled] = React.useState(false);
  const { user, loading } = useUser();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !isLanding;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        solid
          ? "bg-paper/80 supports-[backdrop-filter]:bg-paper/60 border-b backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href={routes.home}
            className="focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <Logo />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "hover:text-orange focus-visible:ring-ring rounded-sm px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
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
                    <Link href={routes.console}>
                      <LayoutDashboard className="size-4" />
                      Console
                    </Link>
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
                variant={solid ? "default" : "secondary"}
                className="hidden md:inline-flex"
              >
                <Link href={routes.signin}>Sign in</Link>
              </Button>
            )}

            <MobileMenu />
          </div>
        </div>
      </Container>
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
              <Link
                href={link.href}
                className="hover:bg-accent rounded-sm px-3 py-2.5 text-base font-medium"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Link
              href={routes.signin}
              className="bg-primary text-primary-foreground mt-4 rounded-sm px-3 py-2.5 text-center text-base font-medium"
            >
              Sign in
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
