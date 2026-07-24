"use client";

import * as React from "react";

/**
 * "What we do" as a scroll-driven horizontal accordion. The section pins while
 * you scroll; one panel is expanded, the rest collapse to labelled slivers, and
 * the active panel advances What → Why → Who → How as you go. After the last
 * one the section releases and the page scrolls on. Mobile gets a plain stack —
 * pinned horizontal scroll is miserable on a phone.
 */
type Panel = {
  key: string;
  index: string;
  kicker: string;
  title: string;
  body: string;
  color: string;
};

const PANELS: Panel[] = [
  {
    key: "what",
    index: "01",
    kicker: "What",
    title: "A student cloud community.",
    body: "AWS Student Builder Group at VJIT — students who'd rather build on the cloud than just read about it. Workshops, projects, hackathons, all run by students.",
    color: "#FF9900",
  },
  {
    key: "why",
    index: "02",
    kicker: "Why",
    title: "Cloud, made approachable.",
    body: "Cloud sounds intimidating from the outside. We make it something you do with your own hands in a room full of people doing the same — not another slide deck.",
    color: "#43B4FF",
  },
  {
    key: "who",
    index: "03",
    kicker: "Who",
    title: "Every branch. Every year.",
    body: "No gatekeeping and no prior AWS experience required. First-years and final-years, CSE to Mechanical — if you're curious, you belong here.",
    color: "#FF57EA",
  },
  {
    key: "how",
    index: "04",
    kicker: "How",
    title: "Learn by shipping.",
    body: "Hands-on sessions, real projects, hackathons and challenges — then we show what we built. You leave having deployed something, not just heard about it.",
    color: "#2EE6A0",
  },
];

export function WhatWeDoScroller() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) return;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const progress = scrolled / total;
        setActive(
          Math.min(PANELS.length - 1, Math.floor(progress * PANELS.length)),
        );
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="bg-[#080a10]">
      {/* Desktop: pinned horizontal accordion. */}
      <div ref={wrapRef} className="relative hidden lg:block lg:h-[420vh]">
        <div className="sticky top-0 flex h-screen w-full overflow-hidden">
          {PANELS.map((p, i) => {
            const isActive = i === active;
            return (
              <div
                key={p.key}
                className="relative flex h-full flex-col justify-end overflow-hidden border-l border-white/10 transition-[flex-grow] duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]"
                style={{
                  flexGrow: isActive ? 7 : 0.7,
                  flexBasis: 0,
                  background: isActive
                    ? `linear-gradient(160deg, color-mix(in oklab, ${p.color} 14%, #080a10) 0%, #080a10 60%)`
                    : "#0a0d14",
                }}
              >
                {/* index rail — always visible */}
                <div className="absolute top-8 left-8">
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: p.color }}
                  >
                    {p.index}
                  </span>
                </div>

                {/* collapsed label — vertical */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
                  style={{ opacity: isActive ? 0 : 1 }}
                >
                  <span
                    className="font-display block text-2xl font-bold tracking-tight whitespace-nowrap [writing-mode:vertical-rl]"
                    style={{ color: p.color }}
                  >
                    {p.kicker}
                  </span>
                </div>

                {/* expanded content */}
                <div
                  className="relative max-w-xl p-10 transition-opacity duration-500 lg:p-14"
                  style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <p
                    className="font-mono text-xs tracking-[0.22em] uppercase"
                    style={{ color: p.color }}
                  >
                    {p.kicker} we do
                  </p>
                  <h3 className="font-display mt-4 text-[clamp(2rem,3.4vw,3.5rem)] leading-[0.98] font-bold tracking-[-0.03em] text-balance text-white">
                    {p.title}
                  </h3>
                  <p className="mt-5 max-w-md leading-relaxed text-white/60">
                    {p.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: plain vertical stack. */}
      <div className="lg:hidden">
        <div className="px-6 pt-16 pb-4">
          <p className="font-pixel text-orange text-[0.6rem] tracking-[0.25em]">
            {"// what we do"}
          </p>
        </div>
        {PANELS.map((p) => (
          <div
            key={p.key}
            className="border-t border-white/10 px-6 py-10"
            style={{
              background: `linear-gradient(160deg, color-mix(in oklab, ${p.color} 12%, #080a10), #080a10 70%)`,
            }}
          >
            <span
              className="font-mono text-sm font-bold"
              style={{ color: p.color }}
            >
              {p.index}
            </span>
            <p
              className="mt-3 font-mono text-xs tracking-[0.22em] uppercase"
              style={{ color: p.color }}
            >
              {p.kicker} we do
            </p>
            <h3 className="font-display mt-2 text-3xl leading-tight font-bold tracking-[-0.03em] text-balance text-white">
              {p.title}
            </h3>
            <p className="mt-4 leading-relaxed text-white/60">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
