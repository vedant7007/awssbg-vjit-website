import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { Container } from "./Container";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /** Set false to opt out of the standard Container wrapper. */
  contained?: boolean;
};

/** A page section with the standard vertical rhythm (py-24 md:py-32). */
export function Section({
  className,
  contained = true,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-24 md:py-32", className)} {...props}>
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}

/** Eyebrow + heading block used at the top of most sections. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
