"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP ScrollTrigger reveal primitive. Registers the plugin client-side only
 * and cleans up via gsap.context. Honors prefers-reduced-motion by leaving the
 * content in its final state without animating.
 */
export function ScrollReveal({
  children,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
