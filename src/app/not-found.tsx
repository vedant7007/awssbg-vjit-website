/*
 * Owner: Rishikesh
 * Status: production-ready
 *
 * Custom 404 page for AWS SBG VJIT. On-brand, playful but neutral copy.
 * Uses a Zap (bolt) icon from lucide-react.
 * No jokes referencing crashes, death, or stack traces.
 */
import Link from "next/link";
import { Zap } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      {/* Subtle grid backdrop matching the landing hero */}
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-40"
        aria-hidden
      />

      <Logo />

      {/* Bolt icon visual */}
      <span
        className="bg-orange/10 border-orange/20 flex h-16 w-16 items-center justify-center rounded-sm border"
        aria-hidden
      >
        <Zap className="text-orange size-8" strokeWidth={1.5} />
      </span>

      <p className="eyebrow">Error 404</p>

      <h1 className="font-display max-w-lg text-4xl font-bold tracking-tight md:text-5xl">
        This page did not provision.
      </h1>

      <p className="text-muted-foreground max-w-md text-base leading-relaxed">
        The page you are looking for does not exist or may have moved. No
        infrastructure was harmed in the making of this message.
      </p>

      <Button asChild size="lg">
        <Link href={routes.home}>Back to home</Link>
      </Button>
    </div>
  );
}
