"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { RollingText } from "@/components/motion/RollingText";

/**
 * The numbers — a restrained, premium counter band. Figures tick up from zero
 * the first time the section enters view, an accent rule draws in beneath each,
 * and a soft aurora drifts behind. No floating chaos: big type, hairlines, and
 * one accent per stat carry it.
 */
type Stat = {
  /** Numeric target for the count-up; null for a word (e.g. "Silver"). */
  to: number | null;
  display: string;
  suffix?: string;
  label: string;
  detail: string;
  color: string;
};

const STATS: Stat[] = [
  {
    to: 150,
    display: "150",
    suffix: "+",
    label: "Students reached",
    detail: "Across workshops, sessions & community events.",
    color: "#FF9900",
  },
  {
    to: 40,
    display: "40",
    suffix: "+",
    label: "Core team",
    detail: "Students running sessions, design, outreach & events.",
    color: "#43B4FF",
  },
  {
    to: null,
    display: "Silver",
    label: "AWS SBG badge",
    detail: "Earned as an official AWS Student Builder Group.",
    color: "#AD5CFF",
  },
  {
    to: 2,
    display: "2",
    suffix: "+",
    label: "Events run",
    detail: "Intro to Cloud Computing & Cloud Tycoon — more coming.",
    color: "#2EE6A0",
  },
];

/** Fires true once, the first time the element scrolls into view. */
function useInView<T extends Element>(ref: React.RefObject<T | null>) {
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen]);
  return seen;
}

function Counter({ to, start }: { to: number; start: boolean }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let raf = 0;
    const dur = 1400;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to]);
  return <>{n}</>;
}

export function ImpactStars() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <section className="relative overflow-hidden bg-[#06080e] py-24 lg:py-32">
      {/* drifting aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(40% 60% at 18% 30%, rgba(255,153,0,0.10), transparent 60%), radial-gradient(45% 55% at 82% 70%, rgba(67,180,255,0.10), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
        }}
      />

      <div ref={ref} className="relative mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="font-pixel text-orange text-[0.6rem] tracking-[0.25em]">
            {"// the numbers"}
          </p>
          <RollingText
            as="h2"
            text="Small club. Real dents."
            className="font-display mt-5 text-[clamp(1.9rem,4.2vw,3.25rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance text-white"
          />
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50">
            Every figure is one we can point at — nothing rounded up for show.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-y-14 lg:grid-cols-4 lg:gap-0">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="group relative px-2 text-center lg:px-8 lg:text-left"
              style={
                {
                  "--accent": s.color,
                  transitionDelay: `${i * 90}ms`,
                } as React.CSSProperties
              }
            >
              {/* hairline divider between columns on desktop */}
              {i > 0 ? (
                <span
                  aria-hidden
                  className="absolute top-2 bottom-2 left-0 hidden w-px bg-white/10 lg:block"
                />
              ) : null}

              <dd
                className={cn(
                  "font-display flex items-start justify-center leading-none font-extrabold tracking-tight tabular-nums lg:justify-start",
                  s.to === null
                    ? "text-[clamp(2rem,4.4vw,3.5rem)]"
                    : "text-[clamp(3rem,7vw,5.5rem)]",
                )}
                style={{
                  color: "transparent",
                  backgroundImage: `linear-gradient(180deg, #ffffff 30%, ${s.color})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  transform: inView ? "translateY(0)" : "translateY(14px)",
                  opacity: inView ? 1 : 0,
                  transition: "transform 700ms ease, opacity 700ms ease",
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                {s.to !== null ? (
                  <Counter to={s.to} start={inView} />
                ) : (
                  s.display
                )}
                {s.suffix ? (
                  <span style={{ color: s.color }}>{s.suffix}</span>
                ) : null}
              </dd>

              {/* accent rule that draws in */}
              <span
                aria-hidden
                className="mx-auto mt-5 block h-0.5 origin-left rounded-full lg:mx-0"
                style={{
                  background: s.color,
                  width: "44px",
                  transform: inView ? "scaleX(1)" : "scaleX(0)",
                  transition: "transform 700ms cubic-bezier(0.7,0,0.3,1)",
                  transitionDelay: `${300 + i * 90}ms`,
                }}
              />

              <dt className="mt-5 font-mono text-xs tracking-[0.16em] text-white/75 uppercase">
                {s.label}
              </dt>
              <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-white/45 lg:mx-0">
                {s.detail}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
