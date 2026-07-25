"use client";

import * as React from "react";
import { gsap } from "gsap";

/**
 * The same mark animation the homepage loader uses: the four "E" arms fly in
 * from each edge with a springy overshoot, then a glare sweeps across. Here it
 * loops the glare so the mark stays alive while the launch button waits, and it
 * skips the navbar dock (there's no navbar on the launch stage).
 */
export function LaunchLogo() {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const logo = ref.current;
    if (!logo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const OFF = 300; // off-canvas travel (viewBox units)
      const PD = 0.45; // per-arm duration
      const GAP = 0.32; // time between arms

      gsap.set([logo, ".ll-piece", ".ll-glare"], { force3D: true });
      gsap.set(".ll-piece", { opacity: 0 });
      gsap.set(".ll-piece-left", { x: -OFF });
      gsap.set(".ll-piece-bottom", { y: OFF });
      gsap.set(".ll-piece-right", { x: OFF });
      gsap.set(".ll-piece-top", { y: -OFF });
      gsap.set(".ll-glare", {
        x: -680,
        rotation: 18,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({
        defaults: { duration: PD, ease: "back.out(1.6)", force3D: true },
      });
      tl.to(".ll-piece-left", { x: 0, opacity: 1 }, 0);
      tl.to(".ll-piece-bottom", { y: 0, opacity: 1 }, GAP);
      tl.to(".ll-piece-right", { x: 0, opacity: 1 }, GAP * 2);
      tl.to(".ll-piece-top", { y: 0, opacity: 1 }, GAP * 3);

      const glareStart = GAP * 3 + PD + 0.1;
      tl.fromTo(
        ".ll-glare",
        { x: -680 },
        { x: 680, duration: 1.0, ease: "power1.inOut" },
        glareStart,
      );

      // Keep the glare sweeping on a gentle loop after the assemble.
      gsap.to(".ll-glare", {
        x: 680,
        duration: 1.1,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 1.8,
        delay: glareStart + 1.4,
        startAt: { x: -680 },
      });
    }, logo);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 900 900"
      fill="#FF9900"
      aria-hidden="true"
      className="launch-logo-svg"
    >
      <defs>
        <clipPath id="launch-logo-clip">
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
        <linearGradient id="launch-logo-glare" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="ll-piece ll-piece-top">
        <rect x="200" y="100" width="500" height="100" />
        <rect x="200" y="0" width="100" height="100" />
        <rect x="400" y="0" width="100" height="100" />
        <rect x="600" y="0" width="100" height="100" />
      </g>
      <g className="ll-piece ll-piece-right">
        <rect x="700" y="200" width="100" height="500" />
        <rect x="800" y="200" width="100" height="100" />
        <rect x="800" y="400" width="100" height="100" />
        <rect x="800" y="600" width="100" height="100" />
      </g>
      <g className="ll-piece ll-piece-bottom">
        <rect x="200" y="700" width="500" height="100" />
        <rect x="200" y="800" width="100" height="100" />
        <rect x="400" y="800" width="100" height="100" />
        <rect x="600" y="800" width="100" height="100" />
      </g>
      <g className="ll-piece ll-piece-left">
        <rect x="100" y="200" width="100" height="500" />
        <rect x="0" y="200" width="100" height="100" />
        <rect x="0" y="400" width="100" height="100" />
        <rect x="0" y="600" width="100" height="100" />
      </g>

      <g clipPath="url(#launch-logo-clip)">
        <rect
          className="ll-glare"
          x="360"
          y="-300"
          width="180"
          height="1500"
          fill="url(#launch-logo-glare)"
        />
      </g>
    </svg>
  );
}
