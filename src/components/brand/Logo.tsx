import * as React from "react";

import { cn } from "@/lib/utils/cn";

/*
 * Wordmark for AWS SBG VJIT. Renders as text until the official SVG brandmark
 * lands in /brand-assets/logos (TODO(Vedant): swap the "cloud" glyph area for
 * the approved mark). The accent word uses the duospace face per brand guidance.
 */
type LogoVariant = "default" | "mono" | "compact";

export function Logo({
  variant = "default",
  className,
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  const accent = variant === "mono" ? "text-current" : "text-orange";

  if (variant === "compact") {
    return (
      <span
        className={cn("font-duo text-lg font-bold tracking-tight", className)}
        aria-label="AWS SBG VJIT"
      >
        <span className={accent}>a</span>sbg
      </span>
    );
  }

  return (
    <span
      className={cn(
        "font-display inline-flex items-baseline gap-1.5 text-lg font-bold tracking-tight",
        className,
      )}
      aria-label="AWS SBG VJIT"
    >
      <span className={cn("font-duo", accent)}>AWS</span>
      <span>SBG</span>
      <span className="text-muted-foreground">VJIT</span>
    </span>
  );
}
