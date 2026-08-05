"use client";

import * as React from "react";

export type StatDef = {
  label: string;
  value: number;
  color: string;
  danger?: boolean;
};

function useCountUp(to: number): number {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const dur = 900;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return n;
}

function Tile({ stat }: { stat: StatDef }) {
  const n = useCountUp(stat.value);
  const active = stat.danger ? stat.value > 0 : true;
  return (
    <div
      className="group relative overflow-hidden rounded-xl border p-5"
      style={{
        borderColor: `color-mix(in oklab, ${stat.color} 30%, var(--border))`,
        background: `linear-gradient(150deg, color-mix(in oklab, ${stat.color} 10%, var(--card)) 0%, var(--card) 70%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute -top-8 -right-8 size-24 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: stat.color }}
      />
      <div
        className="font-display text-4xl font-bold tabular-nums"
        style={{ color: active ? stat.color : "var(--muted-foreground)" }}
      >
        {n}
      </div>
      <div className="text-muted-foreground mt-1 font-mono text-xs tracking-wide uppercase">
        {stat.label}
      </div>
    </div>
  );
}

/** Animated stat tiles with a per-metric accent + soft glow. */
export function TaskStats({ stats }: { stats: StatDef[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <Tile key={s.label} stat={s} />
      ))}
    </div>
  );
}
