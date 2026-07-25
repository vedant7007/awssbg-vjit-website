"use client";

import * as React from "react";

import { LogoMark } from "@/components/brand/LogoMark";

/**
 * The launch sequence — a hidden, presenter-driven reveal for the site's
 * go-live moment.
 *
 * Trigger it secretly (nothing shows until you do):
 *   • type the word "launch" anywhere on the page, or
 *   • add #launch to the URL and reload / press Enter in the address bar, or
 *   • press the key combo Ctrl/Cmd + Shift + L.
 *
 * Flow: a black stage where the AWS SBG mark assembles itself → a "Launch the
 * website" button → Space (or click) starts a 10 → 0 countdown → the stage
 * fades away over the live site while soft confetti drifts down. Esc cancels
 * before launch.
 *
 * Kept deliberately light: confetti is flat fills (no per-particle blur or
 * additive blending), so the reveal never drags the page.
 */

type Phase = "idle" | "armed" | "counting" | "reveal";

const SECRET_WORD = "launch";

export function LaunchSequence() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [count, setCount] = React.useState(10);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const phaseRef = React.useRef<Phase>("idle");
  phaseRef.current = phase;

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const arm = React.useCallback(() => {
    if (phaseRef.current !== "idle") return;
    setPhase("armed");
  }, []);

  const cancel = React.useCallback(() => {
    setPhase("idle");
    setCount(10);
  }, []);

  const launch = React.useCallback(() => {
    if (phaseRef.current !== "armed") return;
    setPhase("counting");
    setCount(10);
  }, []);

  /* -------- secret triggers: typed word, hotkey, and #launch hash -------- */
  React.useEffect(() => {
    let typed = "";
    const isField = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "l"
      ) {
        e.preventDefault();
        arm();
        return;
      }
      if (isField(e.target)) return;
      if (/^[a-z]$/i.test(e.key)) {
        typed = (typed + e.key.toLowerCase()).slice(-SECRET_WORD.length);
        if (typed === SECRET_WORD) {
          typed = "";
          arm();
        }
      }
    };

    const checkHash = () => {
      if (window.location.hash.toLowerCase() === "#launch") arm();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", checkHash);
    checkHash();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", checkHash);
    };
  }, [arm]);

  /* --------------- stage-level keys: Space launches, Esc cancels ---------- */
  React.useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "reveal") {
        e.preventDefault();
        cancel();
      }
      if ((e.key === " " || e.code === "Space") && phase === "armed") {
        e.preventDefault();
        launch();
      }
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll while the stage covers the page.
    const prev = document.body.style.overflow;
    if (phase !== "reveal") document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [phase, launch, cancel]);

  /* ----------------------------- countdown ------------------------------- */
  React.useEffect(() => {
    if (phase !== "counting") return;
    if (count <= 0) {
      window.scrollTo({ top: 0, behavior: "auto" });
      setPhase("reveal");
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, count]);

  /* ---------------------- reveal: confetti + finish ---------------------- */
  React.useEffect(() => {
    if (phase !== "reveal") return;

    const showMs = reduce ? 700 : 4200;
    const stop = reduce
      ? () => {}
      : startConfetti(canvasRef.current, showMs - 400);

    const done = window.setTimeout(() => {
      setPhase("idle");
      setCount(10);
    }, showMs);

    return () => {
      stop();
      clearTimeout(done);
    };
  }, [phase, reduce]);

  if (phase === "idle") return null;

  return (
    <div
      className="launch-stage"
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label="Website launch"
    >
      {/* Black backdrop — fades away during the reveal so the site shows. */}
      <div className="launch-backdrop" aria-hidden />

      {/* Confetti canvas sits above everything, never blocks clicks. */}
      <canvas ref={canvasRef} className="launch-fx" aria-hidden />

      {/* ARMED — the mark assembles, then the launch button. */}
      {phase === "armed" ? (
        <div className="launch-panel">
          <div className="launch-stars" aria-hidden />
          <div className="launch-logo" aria-hidden>
            <LogoMark />
          </div>
          <p className="launch-kicker">AWS · SBG · VJIT</p>
          <h2 className="launch-title">Ready for lift-off?</h2>
          <button
            type="button"
            className="launch-btn"
            onClick={launch}
            autoFocus
          >
            Launch the website
          </button>
          <p className="launch-hint">
            Press <kbd>Space</kbd> to launch · <kbd>Esc</kbd> to cancel
          </p>
        </div>
      ) : null}

      {/* COUNTING — the reverse countdown. */}
      {phase === "counting" ? (
        <div className="launch-panel">
          <div className="launch-stars" aria-hidden />
          <p className="launch-kicker">Launching in</p>
          <div key={count} className="launch-count">
            {count}
          </div>
          <div className="launch-bar" aria-hidden>
            <span style={{ animationDuration: "10s" }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Soft confetti: flat rounded rectangles drifting down on a DPR-scaled canvas.
 * No shadowBlur, no additive blending — cheap enough to run over the live page
 * without jank. Returns a stop() cleanup. */
function startConfetti(
  canvas: HTMLCanvasElement | null,
  durationMs: number,
): () => void {
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const COLORS = [
    "#FF9900",
    "#FFD54A",
    "#43B4FF",
    "#AD5CFF",
    "#FF57EA",
    "#2EE6A0",
    "#FFFFFF",
  ];
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  type Piece = {
    x: number;
    y: number;
    w: number;
    h: number;
    vy: number;
    vx: number;
    rot: number;
    vr: number;
    sway: number;
    color: string;
  };

  const spawn = (top: boolean): Piece => ({
    x: Math.random() * W(),
    y: top ? -20 - Math.random() * 40 : -20 - Math.random() * H() * 0.6,
    w: 6 + Math.random() * 6,
    h: 9 + Math.random() * 7,
    vy: 40 + Math.random() * 55, // px/sec — gentle
    vx: (Math.random() - 0.5) * 26,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 3,
    sway: Math.random() * Math.PI * 2,
    color: COLORS[(Math.random() * COLORS.length) | 0] ?? "#FF9900",
  });

  const pieces: Piece[] = Array.from({ length: 150 }, () => spawn(false));

  let raf = 0;
  let prev = 0;
  let elapsed = 0;

  const frame = (ts: number) => {
    if (!prev) prev = ts;
    const dt = Math.min((ts - prev) / 1000, 0.04);
    prev = ts;
    elapsed += dt * 1000;

    ctx.clearRect(0, 0, W(), H());
    for (const p of pieces) {
      p.sway += dt * 2.2;
      p.x += (p.vx + Math.sin(p.sway) * 14) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > H() + 24) {
        // Keep raining until near the end, then let them fall out.
        if (elapsed < durationMs - 1200) Object.assign(p, spawn(true));
        else continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (elapsed < durationMs) {
      raf = requestAnimationFrame(frame);
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}
