"use client";

import * as React from "react";

/**
 * A 3D perspective grid floor whose tiles glow in brand colors as a pointer
 * moves across them, then fade behind it (see .pg-tile in globals.css).
 *
 * Pure DOM + CSS transitions — no WebGL, no per-frame JS. Desktop uses CSS
 * :hover; touch devices get finger-drag lighting; and an ambient shimmer keeps
 * it alive with no interaction. Reduced motion disables the shimmer.
 */

// AWS SBG brand palette (from the brand kit): orange, blue, magenta, green, purple.
const PALETTE = ["#FF9900", "#43B4FF", "#FF57EA", "#2EE6A0", "#AD5CFF"];

export function PerspectiveGrid({
  cols = 24,
  rows = 24,
}: {
  cols?: number;
  rows?: number;
}) {
  const gridRef = React.useRef<HTMLDivElement>(null);

  const tiles = React.useMemo(
    () =>
      Array.from({ length: cols * rows }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return PALETTE[(r + c) % PALETTE.length]!;
      }),
    [cols, rows],
  );

  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Finger-drag lighting for touch/pen (mouse already handled by CSS :hover).
    const flash = (el: Element | null) => {
      if (!el || !el.classList.contains("pg-tile")) return;
      el.classList.add("pg-lit");
      window.setTimeout(() => el.classList.remove("pg-lit"), 45);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      flash(document.elementFromPoint(e.clientX, e.clientY));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Ambient shimmer: occasionally light a few random tiles, with pauses in
    // between so it glows now and then ("kabhi kabhi"), not constantly.
    let timer = 0;
    const nodes = grid.children;
    const tick = () => {
      if (Math.random() < 0.55) {
        const count = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < count; k++) {
          const el = nodes[Math.floor(Math.random() * nodes.length)];
          if (el) {
            el.classList.add("pg-lit");
            window.setTimeout(() => el.classList.remove("pg-lit"), 90);
          }
        }
      }
      timer = window.setTimeout(tick, 420 + Math.random() * 1300);
    };
    if (!reduced) timer = window.setTimeout(tick, 600);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ perspective: "2000px" }}
      aria-hidden
    >
      <div
        ref={gridRef}
        className="absolute top-1/2 left-1/2 grid"
        style={{
          width: "170vmax",
          height: "170vmax",
          transform:
            "translate(-50%, -50%) rotateX(30deg) rotateY(-5deg) rotateZ(20deg) scale(1.35)",
          transformStyle: "preserve-3d",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {tiles.map((color, i) => (
          <div
            key={i}
            className="pg-tile"
            style={{ ["--pg-c" as string]: color }}
          />
        ))}
      </div>
    </div>
  );
}
