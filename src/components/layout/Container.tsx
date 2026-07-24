import * as React from "react";

import { cn } from "@/lib/utils/cn";

/** Content column: full width on mobile, 80% with 10% gutters from md up. */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full px-6 md:w-4/5 md:px-0", className)}
      {...props}
    />
  );
}
