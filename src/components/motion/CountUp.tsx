"use client";

import * as React from "react";

/**
 * Counts up to `value` the first time it scrolls into view. Reduced-motion and
 * SSR both render the final number immediately, so the value is never hidden.
 */
export function CountUp({
  value,
  suffix = "",
  durationMs = 1100,
  className,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(value);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    setDisplay(0);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry || !entry.isIntersecting || started.current) return;
        started.current = true;

        let raf = 0;
        let startTs = 0;
        const step = (ts: number) => {
          if (!startTs) startTs = ts;
          const p = Math.min((ts - startTs) / durationMs, 1);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(eased * value));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        io.disconnect();
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => io.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
