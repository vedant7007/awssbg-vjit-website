"use client";

import * as React from "react";

/**
 * The launch sequence — a hidden, presenter-driven reveal for the site's
 * go-live moment.
 *
 * Trigger it secretly (nothing shows until you do):
 *   • type the word "launch" anywhere on the page, or
 *   • add #launch to the URL and reload / press Enter in the address bar, or
 *   • press the key combo Ctrl/Cmd + Shift + L.
 *
 * Flow: a full-screen black stage with a "Launch the website?" button →
 * Space (or click) starts a 10 → 0 countdown → theatre curtains part over the
 * live site while fireworks burst across it. Esc cancels before launch.
 *
 * Everything is self-contained (no libraries); fireworks run on a DPR-scaled
 * canvas. Honors reduced motion with a shorter, calmer reveal.
 */

type Phase = "idle" | "armed" | "counting" | "curtains";

const SECRET_WORD = "launch";

export function LaunchSequence() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [count, setCount] = React.useState(10);
  const [curtainsOpen, setCurtainsOpen] = React.useState(false);
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
    setCurtainsOpen(false);
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
      // Ctrl/Cmd + Shift + L
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
      // Typed secret word.
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
      if (e.key === "Escape" && phase !== "curtains") {
        e.preventDefault();
        cancel();
      }
      if ((e.key === " " || e.code === "Space") && phase === "armed") {
        e.preventDefault();
        launch();
      }
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll while the stage is up.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [phase, launch, cancel]);

  /* ----------------------------- countdown ------------------------------- */
  React.useEffect(() => {
    if (phase !== "counting") return;
    if (count <= 0) {
      // Reveal the top of the page, then part the curtains + fire.
      window.scrollTo({ top: 0, behavior: "auto" });
      setPhase("curtains");
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, count]);

  /* --------------------- curtains + fireworks + finish ------------------- */
  React.useEffect(() => {
    if (phase !== "curtains") return;

    // Part the curtains on the next frame so the CSS transition runs.
    const raf = requestAnimationFrame(() => setCurtainsOpen(true));

    const showMs = reduce ? 1400 : 4600;
    const stopFireworks = reduce
      ? () => {}
      : startFireworks(canvasRef.current, showMs - 900);

    const done = window.setTimeout(() => {
      setPhase("idle");
      setCurtainsOpen(false);
      setCount(10);
    }, showMs);

    return () => {
      cancelAnimationFrame(raf);
      stopFireworks();
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
      {/* Fireworks canvas — only meaningful during the reveal. */}
      <canvas ref={canvasRef} className="launch-fx" aria-hidden />

      {/* ARMED — the black stage with the launch button. */}
      {phase === "armed" ? (
        <div className="launch-panel">
          <div className="launch-stars" aria-hidden />
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

      {/* CURTAINS — theatre panels that part over the live site. */}
      {phase === "curtains" ? (
        <div
          className={`launch-curtains${curtainsOpen ? "is-open" : ""}`}
          aria-hidden
        >
          <div className="launch-curtain left">
            <span className="launch-curtain-trim" />
          </div>
          <div className="launch-curtain right">
            <span className="launch-curtain-trim" />
          </div>
          <div className={`launch-flash${curtainsOpen ? "go" : ""}`} />
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fireworks: additive glowing particle bursts on a DPR-scaled canvas. Returns
 * a stop() cleanup. Draws nothing but the bursts, so it layers over the live
 * page revealed between the curtains. */
function startFireworks(
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
    "#43B4FF",
    "#AD5CFF",
    "#FF57EA",
    "#2EE6A0",
    "#FFD54A",
    "#FFFFFF",
  ];
  type P = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    decay: number;
    color: string;
    size: number;
  };
  let particles: P[] = [];

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const burst = (x: number, y: number) => {
    const color = COLORS[(Math.random() * COLORS.length) | 0] ?? "#FF9900";
    const n = 55 + ((Math.random() * 55) | 0);
    for (let i = 0; i < n; i++) {
      const a = Math.PI * 2 * (i / n) + Math.random() * 0.35;
      const sp = 1.6 + Math.random() * 5.4;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
        decay: 0.008 + Math.random() * 0.014,
        color,
        size: 1.4 + Math.random() * 2,
      });
    }
  };

  let raf = 0;
  let last = 0;
  let elapsed = 0;
  let prevTs = 0;

  const frame = (ts: number) => {
    if (!prevTs) prevTs = ts;
    const dt = ts - prevTs;
    prevTs = ts;
    elapsed += dt;

    ctx.clearRect(0, 0, W(), H());
    ctx.globalCompositeOperation = "lighter";

    if (elapsed < durationMs && ts - last > 240) {
      last = ts;
      const bx = W() * (0.12 + Math.random() * 0.76);
      const by = H() * (0.12 + Math.random() * 0.42);
      burst(bx, by);
      if (Math.random() < 0.4)
        burst(W() * (0.3 + Math.random() * 0.4), H() * 0.3);
    }

    for (const p of particles) {
      p.vy += 0.03; // gravity
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) continue;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    particles = particles.filter((p) => p.life > 0);

    if (elapsed < durationMs || particles.length) {
      raf = requestAnimationFrame(frame);
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}
