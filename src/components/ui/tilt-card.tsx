"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A card that tilts toward the pointer in 3D, with a glare that follows it.
 * Everything animated is a transform/opacity, and the whole effect is dropped
 * under `prefers-reduced-motion` (see .tilt in globals.css).
 */
export function TiltCard({
  children,
  className,
  max = 7,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  /** Maximum rotation in degrees. */
  max?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const frame = React.useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    const { left, top, width, height } = el.getBoundingClientRect();
    const px = (e.clientX - left) / width;
    const py = (e.clientY - top) / height;
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * 2 * max}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
    });
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  React.useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn("tilt", className)}
      {...rest}
    >
      <span className="tilt-glare" aria-hidden />
      {children}
    </div>
  );
}
