import * as React from "react";

import { cn } from "@/lib/utils/cn";

/** Centered content column capped at the brand max width. */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1240px] px-6 md:px-8", className)}
      {...props}
    />
  );
}
