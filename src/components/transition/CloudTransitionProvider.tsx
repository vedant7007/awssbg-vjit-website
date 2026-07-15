"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";

/**
 * Cloud/fog page transition. App Router unmounts the old route before an exit
 * animation can run, so instead of AnimatePresence we drive a fixed fog OVERLAY
 * with a phase state machine:
 *
 *   idle -> covering -> (router.push) -> covered -> [route mounts] -> revealing -> idle
 *
 * Fog is built from baked fractal-noise cloud sprites (public/transition) that
 * roll in from the edges + a solid white fill for coverage + a faint navy veil.
 * Only transform + opacity animate — the turbulence blur is baked into the PNGs,
 * never tweened — so it stays at 60fps. Back/forward, rapid clicks, reduced
 * motion, and a safety timeout are all handled.
 */

type Phase = "idle" | "covering" | "covered" | "revealing";

const CloudCtx = React.createContext<{ navigate: (href: string) => void }>({
  navigate: () => {},
});

export const useCloudTransition = () => React.useContext(CloudCtx);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function CloudTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const [phase, setPhaseState] = React.useState<Phase>("idle");
  const phaseRef = React.useRef<Phase>("idle");
  const targetRef = React.useRef<string | null>(null);
  const quickRef = React.useRef(false);
  const prevPathRef = React.useRef<string | null>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const safetyRef = React.useRef<number | null>(null);

  const setPhase = React.useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const navigate = React.useCallback(
    (href: string) => {
      if (typeof window === "undefined") return;
      if (!href || href === window.location.pathname) return; // same-href
      if (phaseRef.current !== "idle") return; // busy: ignore
      targetRef.current = href;
      setPhase("covering");
    },
    [setPhase],
  );

  // Route-change detection: our own nav landing -> reveal; an external
  // back/forward (no active transition) -> a short reveal-only dissipate.
  React.useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (prev === null || prev === pathname) return;
    if (phaseRef.current === "covered" || phaseRef.current === "covering") {
      quickRef.current = false;
      setPhase("revealing");
    } else if (phaseRef.current === "idle") {
      quickRef.current = true;
      setPhase("revealing");
    }
  }, [pathname, setPhase]);

  // Drive the GSAP timeline for the current phase. No context.revert() between
  // phases (that would undo the covered state); we kill/replace timelines instead.
  useIsomorphicLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const q = gsap.utils.selector(overlay);

    const clearSafety = () => {
      if (safetyRef.current) {
        window.clearTimeout(safetyRef.current);
        safetyRef.current = null;
      }
    };

    if (phase === "covering") {
      tlRef.current?.kill();
      tlRef.current = buildCover(overlay, q, reduced, () => {
        setPhase("covered");
        const t = targetRef.current;
        if (t) router.push(t);
      });
      clearSafety();
      // Rescue only a stuck cover (route never resolves) — not an active reveal.
      safetyRef.current = window.setTimeout(() => {
        if (phaseRef.current === "covering" || phaseRef.current === "covered") {
          quickRef.current = false;
          setPhase("revealing");
        }
      }, 4000);
    } else if (phase === "revealing") {
      clearSafety();
      tlRef.current?.kill();
      tlRef.current = buildReveal(overlay, q, reduced, quickRef.current, () =>
        setPhase("idle"),
      );
    } else if (phase === "idle") {
      clearSafety();
      tlRef.current?.kill();
      gsap.set(overlay, {
        autoAlpha: 0,
        pointerEvents: "none",
        willChange: "auto",
      });
    }
    // "covered" intentionally leaves the safety timeout running.
  }, [phase, router, setPhase]);

  React.useEffect(() => {
    return () => {
      tlRef.current?.kill();
      if (safetyRef.current) window.clearTimeout(safetyRef.current);
    };
  }, []);

  return (
    <CloudCtx.Provider value={{ navigate }}>
      {children}
      <div
        ref={overlayRef}
        id="cloud-transition"
        aria-hidden={phase === "idle" ? true : undefined}
      >
        {/* Wave 1 — four from the sides. */}
        <div className="cloud c-1" data-dir="top" data-wave="0" />
        <div className="cloud c-2" data-dir="right" data-wave="0" />
        <div className="cloud c-3" data-dir="bottom" data-wave="0" />
        <div className="cloud c-4" data-dir="left" data-wave="0" />
        {/* Wave 2 — two more complete the fill as the first reach the middle. */}
        <div className="cloud c-5" data-dir="left" data-wave="1" />
        <div className="cloud c-6" data-dir="right" data-wave="1" />
      </div>
    </CloudCtx.Provider>
  );
}

type Selector = (s: string) => Element[];

const OFF = 145; // off-screen travel for cloud fields (% of layer size)

/** Off-screen offset for a cloud's entry direction (from its data-dir). */
function offsetFor(el: Element): { xPercent: number; yPercent: number } {
  switch (el.getAttribute("data-dir")) {
    case "top":
      return { xPercent: 0, yPercent: -OFF };
    case "bottom":
      return { xPercent: 0, yPercent: OFF };
    case "left":
      return { xPercent: -OFF, yPercent: 0 };
    default:
      return { xPercent: OFF, yPercent: 0 };
  }
}

/** COVER: six cloud fields slide in from the edges (visible) and overlap to
 *  fill the screen — the clouds themselves are the only cover. */
function buildCover(
  overlay: HTMLElement,
  q: Selector,
  reduced: boolean,
  onDone: () => void,
): gsap.core.Timeline {
  gsap.set(overlay, {
    autoAlpha: 1,
    pointerEvents: "auto",
    willChange: "opacity",
  });
  const tl = gsap.timeline({ onComplete: onDone });
  const clouds = q(".cloud");

  if (reduced) {
    gsap.set(clouds, { autoAlpha: 1, xPercent: 0, yPercent: 0 });
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.12 });
    return tl;
  }

  const E = "sine.inOut";
  const DUR = 1.05;
  const WAVE_GAP = 0.5; // second wave enters as the first nears the middle
  const STAGGER = 0.09;
  clouds.forEach((el, i) => {
    const wave = Number(el.getAttribute("data-wave") ?? 0);
    const localIndex = i % 4;
    gsap.set(el, {
      autoAlpha: 1,
      scale: 1,
      willChange: "transform, opacity",
      ...offsetFor(el),
    });
    tl.to(
      el,
      { xPercent: 0, yPercent: 0, duration: DUR, ease: E },
      wave * WAVE_GAP + localIndex * STAGGER,
    );
  });
  return tl;
}

/** REVEAL: the cloud fields retreat back out the way they came. */
function buildReveal(
  overlay: HTMLElement,
  q: Selector,
  reduced: boolean,
  quick: boolean,
  onDone: () => void,
): gsap.core.Timeline {
  const hide = () =>
    gsap.set(overlay, {
      autoAlpha: 0,
      pointerEvents: "none",
      willChange: "auto",
    });
  const clouds = q(".cloud");

  if (reduced) {
    const tl = gsap.timeline({
      onComplete: () => {
        hide();
        onDone();
      },
    });
    tl.set(overlay, { autoAlpha: 1 });
    tl.to(overlay, { opacity: 0, duration: 0.12 });
    return tl;
  }

  if (quick) {
    // No cover happened (back/forward) — snap the clouds on, then part them fast.
    gsap.set(overlay, { autoAlpha: 1, opacity: 1, pointerEvents: "none" });
    gsap.set(clouds, { autoAlpha: 1, xPercent: 0, yPercent: 0, scale: 1 });
  }

  const D = quick ? 0.7 : 1.25;
  const E = "sine.inOut";
  const tl = gsap.timeline({
    onComplete: () => {
      hide();
      onDone();
    },
  });
  // Retreat in reverse order so the last-in leaves first.
  const ordered = [...clouds].reverse();
  ordered.forEach((el, i) => {
    tl.to(el, { ...offsetFor(el), duration: D, ease: E }, i * 0.09);
  });
  return tl;
}
