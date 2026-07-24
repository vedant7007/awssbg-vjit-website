"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Fixed verdict colours, used regardless of the game's accent for clarity. */
export const CORRECT = "#2EE6A0";
export const WRONG = "#FF5A5F";

/**
 * The outer frame every game sits in: a ringed panel that carries the game's
 * `--accent` and a soft radial wash bleeding down from the top edge.
 */
export function GamePanel({
  accent,
  className,
  children,
}: {
  accent: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ "--accent": accent } as React.CSSProperties}
      className={cn(
        "ring-border/60 bg-card relative overflow-hidden rounded-lg p-6 ring-1 sm:p-9 lg:p-12",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/** The "← Arcade" control shared by every game's header. */
export function ExitButton({ onExit }: { onExit: () => void }) {
  return (
    <button
      type="button"
      onClick={onExit}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring group inline-flex items-center gap-2 rounded-sm font-mono text-xs tracking-[0.15em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
      Arcade
    </button>
  );
}

/** A labelled stat, e.g. "Score 4" or "Best 12". Tabular so it doesn't jitter. */
export function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="text-right leading-none">
      <p className="text-muted-foreground font-mono text-[0.6rem] tracking-[0.18em] uppercase">
        {label}
      </p>
      <p
        className="font-display mt-1 text-xl font-bold tabular-nums"
        style={accent ? { color: "var(--accent)" } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

/** Thin accent-filled progress bar for "question 3 of 10". */
export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div className="bg-border/60 h-1 w-full overflow-hidden rounded-full">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: "var(--accent)" }}
      />
    </div>
  );
}

export type OptionState = "idle" | "correct" | "wrong" | "muted";

/**
 * A large answer button used by the MCQ games. Before an answer is locked in
 * every option is `idle`; after, the chosen/correct ones light up green or red
 * and the rest fade back.
 */
export function OptionButton({
  label,
  onClick,
  disabled,
  state,
  index,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  state: OptionState;
  index: number;
}) {
  const key = ["A", "B", "C", "D"][index] ?? "";
  const tint =
    state === "correct" ? CORRECT : state === "wrong" ? WRONG : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group focus-visible:ring-ring relative flex w-full items-center gap-4 rounded-md px-4 py-4 text-left ring-1 transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none sm:px-5 sm:py-5",
        state === "idle" &&
          "ring-border/60 hover:bg-foreground/[0.03] cursor-pointer",
        state === "muted" && "ring-border/40 opacity-45",
        (state === "correct" || state === "wrong") && "cursor-default",
      )}
      style={
        tint
          ? {
              borderColor: tint,
              boxShadow: `inset 0 0 0 1px ${tint}`,
              backgroundColor: `color-mix(in oklab, ${tint} 10%, transparent)`,
            }
          : undefined
      }
    >
      <span
        aria-hidden
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded font-mono text-xs font-bold transition-colors",
          state === "idle" &&
            "bg-foreground/[0.05] text-muted-foreground group-hover:text-foreground",
          state === "muted" && "bg-foreground/[0.04] text-muted-foreground",
        )}
        style={tint ? { backgroundColor: tint, color: "#0b0f17" } : undefined}
      >
        {key}
      </span>
      <span className="font-display text-base font-semibold sm:text-lg">
        {label}
      </span>
    </button>
  );
}
