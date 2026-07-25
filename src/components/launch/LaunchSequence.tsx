"use client";

import * as React from "react";

import { LogoMark } from "@/components/brand/LogoMark";
import { LaunchLogo } from "./LaunchLogo";

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

  /* ---------------------- reveal: logo, THEN confetti -------------------- */
  React.useEffect(() => {
    if (phase !== "reveal") return;

    // Let the mark finish assembling first, then fire the confetti blast.
    const delay = reduce ? 250 : 2050;
    const blastMs = reduce ? 600 : 3400;
    const showMs = delay + blastMs + 500;

    let stop = () => {};
    const startTimer = window.setTimeout(() => {
      if (!reduce) stop = startConfettiBlast(canvasRef.current, blastMs);
    }, delay);

    const done = window.setTimeout(() => {
      setPhase("idle");
      setCount(10);
    }, showMs);

    return () => {
      clearTimeout(startTimer);
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

      {/* REVEAL — the mark assembles (homepage-style) as confetti blasts and
          the backdrop clears to the live site. */}
      {phase === "reveal" ? (
        <div className="launch-reveal-logo" aria-hidden>
          <LaunchLogo />
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Confetti BLAST: bursts pop at random points across the screen, throwing
 * pieces out in every direction that then arc down under gravity. Flat fills,
 * no blur or additive blending, so it stays smooth over the live page. Returns
 * a stop() cleanup. */
function startConfettiBlast(
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
    vx: number;
    vy: number;
    rot: number;
    vr: number;
    life: number;
    decay: number;
    color: string;
  };

  let pieces: Piece[] = [];

  const burst = (cx: number, cy: number) => {
    const n = 42 + ((Math.random() * 34) | 0);
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 260 + Math.random() * 660; // px/sec
      pieces.push({
        x: cx,
        y: cy,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 140, // slight upward kick
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 12,
        life: 1,
        decay: 0.5 + Math.random() * 0.5,
        color: COLORS[(Math.random() * COLORS.length) | 0] ?? "#FF9900",
      });
    }
  };

  const fireWave = () => {
    const k = 3 + ((Math.random() * 3) | 0);
    for (let i = 0; i < k; i++) {
      burst(
        W() * (0.1 + Math.random() * 0.8),
        H() * (0.15 + Math.random() * 0.55),
      );
    }
  };

  let raf = 0;
  let prev = 0;
  let elapsed = 0;
  let lastFire = 0;
  fireWave(); // immediate opening blast

  const frame = (ts: number) => {
    if (!prev) prev = ts;
    const dt = Math.min((ts - prev) / 1000, 0.04);
    prev = ts;
    elapsed += dt * 1000;

    // Keep popping new bursts across the screen for the first stretch.
    if (elapsed < durationMs - 1400 && ts - lastFire > 240) {
      lastFire = ts;
      fireWave();
    }

    ctx.clearRect(0, 0, W(), H());
    for (const p of pieces) {
      p.vy += 900 * dt; // gravity
      p.vx *= 1 - 1.1 * dt; // air drag
      p.vy *= 1 - 0.35 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    pieces = pieces.filter((p) => p.life > 0 && p.y < H() + 60);

    if (elapsed < durationMs || pieces.length) {
      raf = requestAnimationFrame(frame);
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}
