import * as React from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Neutral empty state. Never fabricate data here; show honest copy instead. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-sm border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <div className="text-muted-foreground mb-4">
        {icon ?? <Inbox className="size-8" aria-hidden />}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
