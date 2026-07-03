import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Honest error surface. Show the real situation; do not silently swallow. */
export function ErrorState({
  title = "Something went wrong",
  description = "Please try again. If it keeps happening, let a core member know.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "border-danger/30 bg-danger/5 flex flex-col items-center justify-center rounded-sm border px-6 py-16 text-center",
        className,
      )}
    >
      <TriangleAlert className="text-danger mb-4 size-8" aria-hidden />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
