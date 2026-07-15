import * as React from "react";

import { cn } from "@/lib/utils/cn";

/*
 * The AWS SBG VJIT brandmark — a white center square wrapped by four
 * three-toothed "E" shapes (900x900 viewBox, verified pixel-perfect; do not
 * redraw). Fill follows currentColor, so `text-orange` sets the mark color.
 * Used in the navbar as the dock target for the intro animation.
 */
export function LogoMark({
  className,
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <svg
      id={id}
      viewBox="0 0 900 900"
      fill="currentColor"
      aria-hidden="true"
      className={cn("text-orange", className)}
    >
      <g>
        <rect x="200" y="100" width="500" height="100" />
        <rect x="200" y="0" width="100" height="100" />
        <rect x="400" y="0" width="100" height="100" />
        <rect x="600" y="0" width="100" height="100" />
      </g>
      <g>
        <rect x="700" y="200" width="100" height="500" />
        <rect x="800" y="200" width="100" height="100" />
        <rect x="800" y="400" width="100" height="100" />
        <rect x="800" y="600" width="100" height="100" />
      </g>
      <g>
        <rect x="200" y="700" width="500" height="100" />
        <rect x="200" y="800" width="100" height="100" />
        <rect x="400" y="800" width="100" height="100" />
        <rect x="600" y="800" width="100" height="100" />
      </g>
      <g>
        <rect x="100" y="200" width="100" height="500" />
        <rect x="0" y="200" width="100" height="100" />
        <rect x="0" y="400" width="100" height="100" />
        <rect x="0" y="600" width="100" height="100" />
      </g>
    </svg>
  );
}
