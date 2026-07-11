import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { Container } from "./Container";

/**
 * Standard interior-page header: eyebrow, title, optional lede, plus an actions
 * slot. Used by console/admin pages and content routes for consistent framing.
 */
export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string | undefined;
  contentClassName?: string | undefined;
}) {
  return (
    <div className={cn("py-12 md:py-16", className)}>
      <Container>
        <div className="flex flex-col gap-4 border-b pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 gap-2">{actions}</div>
          ) : null}
        </div>
        {children ? (
          <div className={cn(contentClassName ?? "mt-8")}>{children}</div>
        ) : null}
      </Container>
    </div>
  );
}
