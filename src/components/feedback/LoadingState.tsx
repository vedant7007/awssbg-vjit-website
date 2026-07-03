import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Inline loading indicator with an accessible status role. */
export function LoadingState({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm",
        className,
      )}
    >
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

/** Simple skeleton block for content placeholders. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-muted animate-pulse rounded-sm", className)} />;
}
