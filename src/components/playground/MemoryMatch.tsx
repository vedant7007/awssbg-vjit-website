"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { GAMES, MEMORY_PAIRS, sample, shuffle } from "./games";
import { ExitButton, GamePanel, GameStage, RailStat, Stat } from "./shared";

const META = GAMES.find((g) => g.id === "memory-match")!;

const PAIRS_PER_ROUND = 8;
/** How long a mismatched pair stays face up before flipping back. */
const PEEK_MS = 900;

type Card = {
  /** Unique per card. */
  key: string;
  /** Shared by the two halves of a pair. */
  pairId: string;
  face: "service" | "job";
  label: string;
};

type Phase = "ready" | "playing" | "won";

function buildDeck(): Card[] {
  const chosen = sample(MEMORY_PAIRS, PAIRS_PER_ROUND);
  const cards: Card[] = [];
  for (const pair of chosen) {
    cards.push({
      key: `${pair.id}-s`,
      pairId: pair.id,
      face: "service",
      label: pair.service,
    });
    cards.push({
      key: `${pair.id}-j`,
      pairId: pair.id,
      face: "job",
      label: pair.job,
    });
  }
  return shuffle(cards);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * A pair-matching grid: eight AWS services and the job each one does, face
 * down. The stored best is the fastest completion in seconds, so it is read
 * with a "lower is better" comparison rather than the shared useBestScore hook.
 */
export function MemoryMatch({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = React.useState<Phase>("ready");
  const [deck, setDeck] = React.useState<Card[]>([]);
  const [flipped, setFlipped] = React.useState<string[]>([]);
  const [matched, setMatched] = React.useState<string[]>([]);
  const [wrongPair, setWrongPair] = React.useState<string[]>([]);
  const [moves, setMoves] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);
  const [best, setBest] = React.useState<number | null>(null);

  // Read the stored best time on mount; missing or unparseable means no best.
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(META.bestKey);
      if (raw !== null) {
        const parsed = Number.parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed > 0) setBest(parsed);
      }
    } catch {
      // Private mode can throw; no best is a fine fallback.
    }
  }, []);

  const start = React.useCallback(() => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setWrongPair([]);
    setMoves(0);
    setSeconds(0);
    setPhase("playing");
  }, []);

  // Round clock.
  React.useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Resolve a pair once two cards are face up.
  React.useEffect(() => {
    if (flipped.length !== 2) return;
    const aKey = flipped[0];
    const bKey = flipped[1];
    if (aKey === undefined || bKey === undefined) return;
    const a = deck.find((c) => c.key === aKey);
    const b = deck.find((c) => c.key === bKey);
    if (!a || !b) return;

    setMoves((m) => m + 1);

    if (a.pairId === b.pairId) {
      setMatched((prev) => [...prev, a.pairId]);
      setFlipped([]);
      return;
    }

    setWrongPair([aKey, bKey]);
    const t = window.setTimeout(() => {
      setFlipped([]);
      setWrongPair([]);
    }, PEEK_MS);
    return () => window.clearTimeout(t);
  }, [flipped, deck]);

  // Win when every pair is found; persist the time if it beats the record.
  React.useEffect(() => {
    if (phase !== "playing") return;
    if (deck.length === 0 || matched.length < PAIRS_PER_ROUND) return;

    setPhase("won");
    setBest((prev) => {
      if (prev !== null && prev <= seconds) return prev;
      try {
        window.localStorage.setItem(META.bestKey, String(seconds));
      } catch {
        // Best-effort persistence.
      }
      return seconds;
    });
  }, [matched, deck.length, phase, seconds]);

  const onFlip = React.useCallback(
    (card: Card) => {
      if (flipped.length === 2) return;
      if (flipped.includes(card.key)) return;
      if (matched.includes(card.pairId)) return;
      setFlipped((prev) => [...prev, card.key]);
    },
    [flipped, matched],
  );

  return (
    <GamePanel accent={META.accent}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <ExitButton onExit={onExit} />
          <h2 className="font-display mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {META.title}
          </h2>
        </div>
        <div className="flex gap-6">
          <Stat label="Time" value={formatTime(seconds)} accent />
          <Stat label="Best" value={best === null ? "—" : formatTime(best)} />
        </div>
      </div>

      {phase === "ready" ? (
        <div className="mt-10">
          <p className="text-muted-foreground max-w-lg leading-relaxed">
            {META.blurb}
          </p>
          <p className="text-muted-foreground mt-6 max-w-lg font-mono text-xs leading-relaxed">
            Every card has a partner: a service on one, the job it does on the
            other. Match all {PAIRS_PER_ROUND} pairs. Only the clock is scored,
            so accuracy beats speed-clicking.
          </p>
          <button
            type="button"
            onClick={start}
            className="focus-visible:ring-ring mt-9 rounded-full px-7 py-3 font-mono text-xs tracking-[0.16em] uppercase transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none"
            style={{ backgroundColor: META.accent, color: "#06080e" }}
          >
            Deal the cards
          </button>
        </div>
      ) : (
        <GameStage
          aside={
            <div>
              <div className="flex items-baseline justify-between gap-6 lg:flex-col lg:items-start lg:gap-8">
                <RailStat
                  label="Pairs found"
                  value={`${matched.length}/${PAIRS_PER_ROUND}`}
                  accent={META.accent}
                />
                <RailStat label="Moves" value={moves} />
              </div>
              <p className="text-muted-foreground mt-8 hidden font-mono text-[0.65rem] leading-relaxed lg:block">
                Every card has a partner: a service on one, the job it does on
                the other. Only the clock is scored.
              </p>
            </div>
          }
        >
          {/* Capped so four columns stay card-sized instead of stretching into
              billboards on a wide panel. */}
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 sm:gap-3">
            {deck.map((card) => {
              const isMatched = matched.includes(card.pairId);
              const isFlipped = flipped.includes(card.key) || isMatched;
              const isWrong = wrongPair.includes(card.key);

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => onFlip(card)}
                  disabled={isFlipped || flipped.length === 2}
                  aria-label={isFlipped ? card.label : "Face-down card"}
                  className={cn(
                    "focus-visible:ring-ring relative grid aspect-[3/4] place-items-center rounded-lg p-1.5 text-center ring-1 transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none sm:p-2",
                    !isFlipped &&
                      "ring-border/60 hover:bg-foreground/[0.04] cursor-pointer",
                    isMatched && "opacity-45",
                  )}
                  style={
                    isWrong
                      ? {
                          boxShadow: "inset 0 0 0 1px #FF5A5F",
                          backgroundColor: "rgba(255,90,95,0.10)",
                        }
                      : isFlipped
                        ? {
                            boxShadow: `inset 0 0 0 1px ${META.accent}`,
                            backgroundColor: `color-mix(in oklab, ${META.accent} 9%, transparent)`,
                          }
                        : undefined
                  }
                >
                  {isFlipped ? (
                    <span
                      className={cn(
                        "leading-tight break-words hyphens-auto",
                        card.face === "service"
                          ? "font-display text-[0.8rem] font-bold sm:text-base"
                          : "text-muted-foreground font-mono text-[0.58rem] sm:text-[0.7rem]",
                      )}
                      style={
                        card.face === "service"
                          ? { color: META.accent }
                          : undefined
                      }
                    >
                      {card.label}
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className="text-muted-foreground/40 font-pixel text-[0.5rem]"
                    >
                      AWS
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {phase === "won" ? (
            <div className="mt-9 text-center">
              <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
                {best === seconds ? "New best time" : "Cleared"}
              </p>
              <p
                className="font-display mt-3 text-[clamp(2.5rem,10vw,4.5rem)] leading-none font-bold tabular-nums"
                style={{ color: META.accent }}
              >
                {formatTime(seconds)}
              </p>
              <p className="text-muted-foreground mt-3 font-mono text-xs">
                {moves} moves
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={start}
                  className="focus-visible:ring-ring inline-flex items-center gap-2 rounded-full px-7 py-3 font-mono text-xs tracking-[0.16em] uppercase transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none"
                  style={{ backgroundColor: META.accent, color: "#06080e" }}
                >
                  <RotateCcw className="size-3.5" />
                  Deal again
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="ring-border/60 hover:bg-foreground/[0.04] focus-visible:ring-ring rounded-full px-7 py-3 font-mono text-xs tracking-[0.16em] uppercase ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  Back to arcade
                </button>
              </div>
            </div>
          ) : null}
        </GameStage>
      )}
    </GamePanel>
  );
}
