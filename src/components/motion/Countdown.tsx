"use client";

import * as React from "react";

/**
 * Ticks down to `targetISO`. Renders nothing until mounted (avoids SSR/client
 * hydration drift on the clock) and hides itself once the target has passed.
 */
export function Countdown({
  targetISO,
  className,
}: {
  targetISO: string;
  className?: string;
}) {
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    const target = new Date(targetISO).getTime();
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetISO]);

  if (remaining === null || remaining <= 0) return null;

  const s = Math.floor(remaining / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  return (
    <span className={className}>
      <Unit value={days} label="d" />
      <Sep />
      <Unit value={hours} label="h" />
      <Sep />
      <Unit value={mins} label="m" />
      <Sep />
      <Unit value={secs} label="s" />
    </span>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span className="tabular-nums">
      {String(value).padStart(2, "0")}
      <span className="text-orange/70">{label}</span>
    </span>
  );
}

function Sep() {
  return <span className="text-white/20"> : </span>;
}
