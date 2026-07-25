"use client";

import * as React from "react";
import { Heart, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  CATCH_CATEGORIES,
  CATCH_SERVICES,
  GAMES,
  shuffle,
  type CatchCategory,
  type CatchService,
} from "./games";
import { useBestScore } from "./useBestScore";
import { CORRECT, ExitButton, GamePanel, Stat, WRONG } from "./shared";

const META = GAMES.find((g) => g.id === "cloud-catch")!;

const ROUND_SECONDS = 60;
const START_LIVES = 3;
/** Seconds a single category stays "called" before the next one is drawn. */
const CATEGORY_SECONDS = 10;
/** Where the basket's mouth sits, as a fraction of the play area's height. */
const CATCH_LINE = 0.86;
/** Half-width of the basket, as a fraction of the play area's width. */
const BASKET_HALF = 0.11;
const MAX_COMBO = 5;

type Phase = "ready" | "playing" | "over";

/** What React needs to paint a chip. Position lives in `liveRef`, not here. */
type Item = {
  id: number;
  svc: CatchService;
  /** Horizontal position as a fraction of the play area's width. */
  x: number;
};

type Live = {
  x: number;
  category: CatchCategory;
  /** Vertical position as a fraction of the play area's height. */
  y: number;
  /** Fall speed in fractions of height per second. */
  vy: number;
};

/** Everything the loop mutates every frame, kept out of React state. */
type Runtime = {
  elapsed: number;
  spawnAt: number;
  nextId: number;
  basketX: number;
  score: number;
  combo: number;
  lives: number;
  category: CatchCategory;
  areaHeight: number;
};

/**
 * An arcade round: service chips fall, one category is called, you catch what
 * belongs to it. All motion runs off refs inside a single rAF loop that writes
 * transforms straight to the DOM. React re-renders only when a chip spawns or
 * resolves and when a counter actually changes, so a mid-range phone holds
 * frame rate. Score and combo live in a ref so the loop stays deterministic
 * under StrictMode's double-invoked updaters.
 */
export function CloudCatch({ onExit }: { onExit: () => void }) {
  const { best, submit } = useBestScore(META.bestKey);

  const [phase, setPhase] = React.useState<Phase>("ready");
  const [items, setItems] = React.useState<Item[]>([]);
  const [score, setScore] = React.useState(0);
  const [combo, setCombo] = React.useState(1);
  const [lives, setLives] = React.useState(START_LIVES);
  const [timeLeft, setTimeLeft] = React.useState(ROUND_SECONDS);
  const [target, setTarget] = React.useState<CatchCategory>("Storage");
  const [flash, setFlash] = React.useState<"hit" | "miss" | null>(null);

  const areaRef = React.useRef<HTMLDivElement | null>(null);
  const basketRef = React.useRef<HTMLDivElement | null>(null);
  const nodesRef = React.useRef(new Map<number, HTMLDivElement>());
  const liveRef = React.useRef(new Map<number, Live>());
  const rt = React.useRef<Runtime>({
    elapsed: 0,
    spawnAt: 0,
    nextId: 1,
    basketX: 0.5,
    score: 0,
    combo: 1,
    lives: START_LIVES,
    category: "Storage",
    areaHeight: 0,
  });

  const registerNode = React.useCallback(
    (id: number, el: HTMLDivElement | null) => {
      if (el) nodesRef.current.set(id, el);
      else nodesRef.current.delete(id);
    },
    [],
  );

  const start = React.useCallback(() => {
    nodesRef.current.clear();
    liveRef.current.clear();
    const first = shuffle(CATCH_CATEGORIES)[0] ?? "Storage";
    rt.current = {
      elapsed: 0,
      spawnAt: 0,
      nextId: 1,
      basketX: 0.5,
      score: 0,
      combo: 1,
      lives: START_LIVES,
      category: first,
      areaHeight: areaRef.current?.clientHeight ?? 0,
    };
    setItems([]);
    setScore(0);
    setCombo(1);
    setLives(START_LIVES);
    setTimeLeft(ROUND_SECONDS);
    setTarget(first);
    setFlash(null);
    setPhase("playing");
  }, []);

  /* ------------------------------- input ------------------------------- */

  const moveBasket = React.useCallback((clientX: number) => {
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = (clientX - rect.left) / rect.width;
    const clamped = Math.min(1 - BASKET_HALF, Math.max(BASKET_HALF, x));
    rt.current.basketX = clamped;
    const basket = basketRef.current;
    if (basket) basket.style.left = `${clamped * 100}%`;
  }, []);

  const onPointer = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (phase !== "playing") return;
      moveBasket(e.clientX);
    },
    [moveBasket, phase],
  );

  React.useEffect(() => {
    if (phase !== "playing") return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const delta = e.key === "ArrowLeft" ? -0.07 : 0.07;
      const next = Math.min(
        1 - BASKET_HALF,
        Math.max(BASKET_HALF, rt.current.basketX + delta),
      );
      rt.current.basketX = next;
      const basket = basketRef.current;
      if (basket) basket.style.left = `${next * 100}%`;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // The loop positions chips in pixels, so keep the measured height current.
  React.useEffect(() => {
    const area = areaRef.current;
    if (!area || phase !== "playing") return;
    rt.current.areaHeight = area.clientHeight;
    const ro = new ResizeObserver(() => {
      rt.current.areaHeight = area.clientHeight;
    });
    ro.observe(area);
    return () => ro.disconnect();
  }, [phase]);

  /* ----------------------------- game loop ----------------------------- */

  React.useEffect(() => {
    if (phase !== "playing") return;

    let raf = 0;
    let stopped = false;
    let last = performance.now();
    let shownTime = ROUND_SECONDS;

    function frame(now: number) {
      if (stopped) return;
      const s = rt.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      s.elapsed += dt;
      const remaining = Math.max(0, ROUND_SECONDS - s.elapsed);
      const secs = Math.ceil(remaining);
      if (secs !== shownTime) {
        shownTime = secs;
        setTimeLeft(secs);
      }

      const slot = Math.floor(s.elapsed / CATEGORY_SECONDS);
      const wanted = CATCH_CATEGORIES[slot % CATCH_CATEGORIES.length];
      if (wanted && wanted !== s.category) {
        s.category = wanted;
        setTarget(wanted);
      }

      // Spawn cadence and fall speed both ramp across the round.
      const progress = s.elapsed / ROUND_SECONDS;
      if (s.elapsed >= s.spawnAt) {
        s.spawnAt = s.elapsed + (0.85 - progress * 0.35);
        const svc =
          CATCH_SERVICES[Math.floor(Math.random() * CATCH_SERVICES.length)];
        if (svc) {
          const id = s.nextId++;
          const x = 0.12 + Math.random() * 0.76;
          liveRef.current.set(id, {
            x,
            category: svc.category,
            y: -0.14,
            vy: 0.24 + progress * 0.26 + Math.random() * 0.06,
          });
          setItems((prev) => [...prev, { id, svc, x }]);
        }
      }

      const height = s.areaHeight || 1;
      const resolved: number[] = [];
      let hit = false;
      let miss = false;

      liveRef.current.forEach((live, id) => {
        const prevY = live.y;
        live.y += live.vy * dt;

        const node = nodesRef.current.get(id);
        if (node) {
          node.style.transform = `translate3d(-50%, ${live.y * height}px, 0)`;
        }

        // Resolve exactly once, on the frame the chip crosses the basket line.
        if (prevY < CATCH_LINE && live.y >= CATCH_LINE) {
          const onTarget = live.category === s.category;
          const caught = Math.abs(live.x - s.basketX) <= BASKET_HALF;

          if (caught && onTarget) {
            s.score += 10 * s.combo;
            s.combo = Math.min(MAX_COMBO, s.combo + 1);
            hit = true;
            resolved.push(id);
          } else if (caught && !onTarget) {
            s.lives -= 1;
            s.combo = 1;
            miss = true;
            resolved.push(id);
          } else if (!caught && onTarget) {
            s.combo = 1;
            miss = true;
          }
        }

        if (live.y > 1.2) resolved.push(id);
      });

      if (resolved.length > 0) {
        const gone = new Set(resolved);
        gone.forEach((id) => {
          liveRef.current.delete(id);
          nodesRef.current.delete(id);
        });
        setItems((prev) => prev.filter((it) => !gone.has(it.id)));
      }

      if (hit || miss) {
        setScore(s.score);
        setCombo(s.combo);
        setLives(s.lives);
        setFlash(hit ? "hit" : "miss");
      }

      if (remaining <= 0 || s.lives <= 0) {
        stopped = true;
        setPhase("over");
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [phase]);

  React.useEffect(() => {
    if (phase === "over") submit(rt.current.score);
  }, [phase, submit]);

  React.useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 220);
    return () => window.clearTimeout(t);
  }, [flash]);

  /* ------------------------------- render ------------------------------ */

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
          <Stat label="Score" value={score} accent />
          <Stat label="Best" value={best} />
        </div>
      </div>

      {phase === "ready" ? (
        <Intro onStart={start} />
      ) : phase === "over" ? (
        <Over score={score} best={best} onRestart={start} onExit={onExit} />
      ) : (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-xs tracking-[0.18em] uppercase">
              <span className="text-muted-foreground">Catch </span>
              <span style={{ color: META.accent }}>{target}</span>
            </p>
            <div className="flex items-center gap-5">
              <span className="font-mono text-xs tracking-[0.14em] uppercase tabular-nums">
                <span className="text-muted-foreground">Combo </span>
                <span style={{ color: META.accent }}>×{combo}</span>
              </span>
              <span className="flex items-center gap-1">
                {Array.from({ length: START_LIVES }, (_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      "size-3.5",
                      i < lives ? "fill-current" : "opacity-25",
                    )}
                    style={i < lives ? { color: WRONG } : undefined}
                  />
                ))}
              </span>
              <span className="font-display text-xl font-bold tabular-nums">
                {timeLeft}
                <span className="text-muted-foreground ml-0.5 text-xs">s</span>
              </span>
            </div>
          </div>

          <div
            ref={areaRef}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            className={cn(
              "ring-border/60 relative mt-4 aspect-[3/4] w-full touch-none overflow-hidden rounded-lg ring-1 transition-colors duration-200 sm:aspect-[16/10]",
              flash === "hit" && "bg-emerald-500/[0.07]",
              flash === "miss" && "bg-red-500/[0.09]",
            )}
          >
            {items.map((item) => (
              <div
                key={item.id}
                ref={(el) => registerNode(item.id, el)}
                className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap will-change-transform"
                style={{ left: `${item.x * 100}%` }}
              >
                <span
                  className="border-border/70 bg-card/90 inline-block rounded-md border px-2.5 py-1.5 font-mono text-[0.7rem] sm:text-xs"
                  style={
                    item.svc.category === target
                      ? {
                          borderColor: META.accent,
                          color: META.accent,
                          boxShadow: `0 0 18px -6px ${META.accent}`,
                        }
                      : undefined
                  }
                >
                  {item.svc.name}
                </span>
              </div>
            ))}

            <div
              ref={basketRef}
              aria-hidden
              className="absolute h-2.5 -translate-x-1/2 rounded-full"
              style={{
                left: "50%",
                top: `${CATCH_LINE * 100}%`,
                width: `${BASKET_HALF * 200}%`,
                backgroundColor: META.accent,
                boxShadow: `0 0 24px -2px ${META.accent}`,
              }}
            />
          </div>

          <p className="text-muted-foreground mt-3 text-center font-mono text-[0.65rem] tracking-wide">
            Drag anywhere in the field — or use ← →
          </p>
        </div>
      )}
    </GamePanel>
  );
}

/* -------------------------------- states -------------------------------- */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="mt-10">
      <p className="text-muted-foreground max-w-lg leading-relaxed">
        {META.blurb}
      </p>
      <ul className="text-muted-foreground mt-6 max-w-lg space-y-2 font-mono text-xs leading-relaxed">
        <li>
          <span style={{ color: CORRECT }}>+</span> Catch a service in the
          called category to score. Back-to-back catches build a combo, up to ×
          {MAX_COMBO}.
        </li>
        <li>
          <span style={{ color: WRONG }}>−</span> Catch the wrong category and
          you lose a life. Let a right one through and the combo resets.
        </li>
        <li>
          <span>·</span> The called category changes every {CATEGORY_SECONDS}{" "}
          seconds, and everything speeds up as the clock runs down.
        </li>
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="focus-visible:ring-ring mt-9 rounded-full px-7 py-3 font-mono text-xs tracking-[0.16em] uppercase transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none"
        style={{ backgroundColor: META.accent, color: "#06080e" }}
      >
        Start round
      </button>
    </div>
  );
}

function Over({
  score,
  best,
  onRestart,
  onExit,
}: {
  score: number;
  best: number;
  onRestart: () => void;
  onExit: () => void;
}) {
  const isBest = score >= best && score > 0;
  return (
    <div className="mt-12 text-center">
      <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
        {isBest ? "New personal best" : "Round over"}
      </p>
      <p
        className="font-display mt-4 text-[clamp(3rem,12vw,6rem)] leading-none font-bold tabular-nums"
        style={{ color: META.accent }}
      >
        {score}
      </p>
      <p className="text-muted-foreground mt-4 font-mono text-xs">
        Best {best}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="focus-visible:ring-ring inline-flex items-center gap-2 rounded-full px-7 py-3 font-mono text-xs tracking-[0.16em] uppercase transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none"
          style={{ backgroundColor: META.accent, color: "#06080e" }}
        >
          <RotateCcw className="size-3.5" />
          Play again
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
  );
}
