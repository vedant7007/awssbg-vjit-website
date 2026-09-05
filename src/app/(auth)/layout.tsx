import * as React from "react";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { Logo } from "@/components/brand/Logo";

/** Minimal centered shell for auth screens. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="app-bg" aria-hidden />
      <header className="flex h-16 items-center px-6">
        <Link
          href={routes.home}
          className="focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        {children}
      </main>
    </div>
  );
}
