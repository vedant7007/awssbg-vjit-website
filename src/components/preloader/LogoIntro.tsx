"use client";

import * as React from "react";
import { gsap } from "gsap";

/**
 * Homepage loading screen: the full AWS SBG mark appears and a light glare
 * sweeps across it, then it docks into the navbar logo slot (read at runtime,
 * FLIP-style) as the overlay fades to reveal the site.
 *
 * - Plays on every load of the homepage; skips on other routes and for
 *   prefers-reduced-motion (a blocking <head> script sets html[data-intro]
 *   before paint; see layout.tsx + globals — so there's no flash).
 * - Animates only transform + opacity; will-change is set during the run and
 *   cleared on complete. GSAP work is scoped to a context and reverted on unmount.
 */

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function LogoIntro({ color = "#05070c" }: { color?: string }) {
  const [show, setShow] = React.useState(true);
  const rootRef = React.useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isHome = window.location.pathname === "/";

    // Only the homepage gets the loader; everything else renders immediately.
    if (reduced || !isHome) {
      setShow(false);
      return;
    }

    const ctx = gsap.context(() => {
      const logo = root.querySelector<SVGSVGElement>(".intro-logo");
      if (!logo) {
        setShow(false);
        return;
      }

      // Batch reads: our logo box (stable, fixed-size svg) + the navbar slot.
      const from = logo.getBoundingClientRect();
      const mark = document.getElementById("site-logo-mark");
      const to = mark?.getBoundingClientRect() ?? null;

      const dock = to
        ? {
            scale: to.width / from.width,
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
          }
        : { scale: 0.12, x: -(from.left - 24), y: -(from.top - 20) };

      const OFF = 300; // off-canvas travel (viewBox units)
      const PD = 0.45; // per-E duration
      const GAP = 0.4; // time between each E

      gsap.set([logo, ".intro-piece", ".intro-glare"], {
        force3D: true,
        willChange: "transform, opacity",
      });
      gsap.set(logo, { opacity: 1, scale: 1, x: 0, y: 0 });
      gsap.set(".intro-piece", { opacity: 0 });
      gsap.set(".piece-left", { x: -OFF });
      gsap.set(".piece-bottom", { y: OFF });
      gsap.set(".piece-right", { x: OFF });
      gsap.set(".piece-top", { y: -OFF });
      gsap.set(".intro-glare", {
        rotation: 18,
        x: -680,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({
        defaults: { force3D: true, duration: PD, ease: "back.out(1.6)" },
        onComplete: () => setShow(false),
      });

      // Phase 1 — one E after another: left, down, right, up.
      tl.to(".piece-left", { x: 0, opacity: 1 }, 0.0);
      tl.to(".piece-bottom", { y: 0, opacity: 1 }, GAP);
      tl.to(".piece-right", { x: 0, opacity: 1 }, GAP * 2);
      tl.to(".piece-top", { y: 0, opacity: 1 }, GAP * 3);

      // Phase 2 — once all four are in, a glare sweeps across the full logo.
      const glareStart = GAP * 3 + PD + 0.1;
      tl.fromTo(
        ".intro-glare",
        { x: -680 },
        { x: 680, duration: 1.0, ease: "power1.inOut" },
        glareStart,
      );

      // Phase 3 — dock into the navbar slot while the overlay fades out.
      tl.addLabel("dock", glareStart + 1.05);
      tl.to(
        logo,
        {
          x: dock.x,
          y: dock.y,
          scale: dock.scale,
          duration: 0.85,
          ease: "power3.inOut",
        },
        "dock",
      );
      tl.to(
        root,
        { opacity: 0, duration: 0.5, ease: "power2.inOut" },
        "dock+=0.3",
      );

      tl.add(() => {
        gsap.set([logo, ".intro-piece", ".intro-glare"], {
          willChange: "auto",
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  if (!show) return null;

  return (
    <div
      id="logo-intro"
      ref={rootRef}
      role="presentation"
      style={{ backgroundColor: color }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <svg
        viewBox="0 0 900 900"
        fill="#FF9900"
        aria-hidden="true"
        className="intro-logo h-auto w-[min(60vw,320px)]"
      >
        <defs>
          <clipPath id="awssbg-logo-clip">
            <rect x="200" y="100" width="500" height="100" />
            <rect x="200" y="0" width="100" height="100" />
            <rect x="400" y="0" width="100" height="100" />
            <rect x="600" y="0" width="100" height="100" />
            <rect x="700" y="200" width="100" height="500" />
            <rect x="800" y="200" width="100" height="100" />
            <rect x="800" y="400" width="100" height="100" />
            <rect x="800" y="600" width="100" height="100" />
            <rect x="200" y="700" width="500" height="100" />
            <rect x="200" y="800" width="100" height="100" />
            <rect x="400" y="800" width="100" height="100" />
            <rect x="600" y="800" width="100" height="100" />
            <rect x="100" y="200" width="100" height="500" />
            <rect x="0" y="200" width="100" height="100" />
            <rect x="0" y="400" width="100" height="100" />
            <rect x="0" y="600" width="100" height="100" />
          </clipPath>
          <linearGradient id="awssbg-glare" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* The mark — four E's, each in its own group for the assembly. */}
        <g className="intro-piece piece-top">
          <rect x="200" y="100" width="500" height="100" />
          <rect x="200" y="0" width="100" height="100" />
          <rect x="400" y="0" width="100" height="100" />
          <rect x="600" y="0" width="100" height="100" />
        </g>
        <g className="intro-piece piece-right">
          <rect x="700" y="200" width="100" height="500" />
          <rect x="800" y="200" width="100" height="100" />
          <rect x="800" y="400" width="100" height="100" />
          <rect x="800" y="600" width="100" height="100" />
        </g>
        <g className="intro-piece piece-bottom">
          <rect x="200" y="700" width="500" height="100" />
          <rect x="200" y="800" width="100" height="100" />
          <rect x="400" y="800" width="100" height="100" />
          <rect x="600" y="800" width="100" height="100" />
        </g>
        <g className="intro-piece piece-left">
          <rect x="100" y="200" width="100" height="500" />
          <rect x="0" y="200" width="100" height="100" />
          <rect x="0" y="400" width="100" height="100" />
          <rect x="0" y="600" width="100" height="100" />
        </g>

        {/* Glare, clipped to the mark. */}
        <g clipPath="url(#awssbg-logo-clip)">
          <rect
            className="intro-glare"
            x="360"
            y="-300"
            width="180"
            height="1500"
            fill="url(#awssbg-glare)"
          />
        </g>
      </svg>
    </div>
  );
}
