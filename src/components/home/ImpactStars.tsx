"use client";

import * as React from "react";

/**
 * The numbers, reimagined as a night sky. Glowing particles drift in a canvas
 * field; the four figures float at different depths and parallax with the
 * pointer; hovering one pulls it forward and reveals the detail. No boxes —
 * everything floats independently. Falls back to a static stack on touch /
 * reduced-motion.
 */
type Star = {
  value: string;
  label: string;
  detail: string;
  /** Position as viewport-relative %, and a depth (parallax strength). */
  x: number;
  y: number;
  depth: number;
  size: string;
  color: string;
};

const STARS: Star[] = [
  {
    value: "150+",
    label: "Students reached",
    detail: "Across workshops, bootcamps, hackathons & community events.",
    x: 22,
    y: 34,
    depth: 1.6,
    size: "clamp(3rem,7vw,6.5rem)",
    color: "#FF9900",
  },
  {
    value: "40+",
    label: "Core team",
    detail: "Students running the sessions, design, outreach and events.",
    x: 70,
    y: 26,
    depth: 1.0,
    size: "clamp(2.5rem,5.5vw,5rem)",
    color: "#43B4FF",
  },
  {
    value: "Silver",
    label: "AWS SBG badge",
    detail: "Earned as an official AWS Student Builder Group.",
    x: 30,
    y: 68,
    depth: 0.7,
    size: "clamp(2.25rem,5vw,4.5rem)",
    color: "#AD5CFF",
  },
  {
    value: "2+",
    label: "Events",
    detail:
      "Introduction to Cloud Computing and Cloud Tycoon — with more coming.",
    x: 74,
    y: 66,
    depth: 1.3,
    size: "clamp(2.5rem,5.5vw,5rem)",
    color: "#2EE6A0",
  },
];

function ParticleField() {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.00016,
      vy: (Math.random() - 0.5) * 0.00016,
      a: Math.random() * 0.5 + 0.15,
      tw: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = 1;
        if (d.x > 1) d.x = 0;
        if (d.y < 0) d.y = 1;
        if (d.y > 1) d.y = 0;
        d.tw += 0.02;
        const alpha = d.a * (0.6 + 0.4 * Math.sin(d.tw));
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,180,90,${alpha})`;
        ctx.shadowColor = "rgba(255,153,0,0.8)";
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

export function ImpactStars() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [m, setM] = React.useState({ x: 0, y: 0 });
  const [active, setActive] = React.useState<number | null>(null);

  const onMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setM({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    });
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#05070c] py-24 lg:py-32">
      <ParticleField />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, rgba(255,153,0,0.06), transparent 70%)",
        }}
      />

      <div className="relative mx-auto mb-4 max-w-2xl px-6 text-center">
        <p className="font-pixel text-orange text-[0.6rem] tracking-[0.25em]">
          {"// the numbers"}
        </p>
        <h2 className="font-display mt-5 text-[clamp(1.75rem,4vw,3rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance text-white">
          Small club. Real dents.
        </h2>
      </div>

      {/* Floating field — desktop parallax; on mobile it's a calm centered stack. */}
      <div
        ref={wrapRef}
        onPointerMove={onMove}
        onPointerLeave={() => {
          setM({ x: 0, y: 0 });
          setActive(null);
        }}
        className="relative mx-auto hidden h-[62vh] max-h-[620px] min-h-[440px] w-full max-w-6xl lg:block"
      >
        {STARS.map((s, i) => {
          const isActive = active === i;
          return (
            <button
              key={s.label}
              type="button"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-default text-center transition-[transform,filter] duration-300 ease-out focus:outline-none"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                transform: `translate(-50%,-50%) translate(${m.x * s.depth * 46}px, ${m.y * s.depth * 46}px) scale(${isActive ? 1.12 : 1})`,
                zIndex: isActive ? 20 : 10,
                filter: isActive
                  ? "none"
                  : active !== null
                    ? "blur(1.5px) opacity(0.5)"
                    : "none",
              }}
            >
              <div
                className="font-display leading-none font-extrabold tracking-tight tabular-nums"
                style={{
                  fontSize: s.size,
                  color: s.color,
                  textShadow: `0 0 32px ${s.color}55, 0 0 4px ${s.color}`,
                }}
              >
                {s.value}
              </div>
              <div className="mt-2 font-mono text-xs tracking-[0.14em] text-white/70 uppercase">
                {s.label}
              </div>
              <p
                className="mx-auto mt-3 max-w-[15rem] text-sm leading-relaxed text-white/55 transition-opacity duration-300"
                style={{ opacity: isActive ? 1 : 0 }}
              >
                {s.detail}
              </p>
            </button>
          );
        })}
      </div>

      {/* Mobile / no-hover fallback */}
      <div className="relative mx-auto grid max-w-md grid-cols-2 gap-x-8 gap-y-10 px-8 py-10 lg:hidden">
        {STARS.map((s) => (
          <div key={s.label} className="text-center">
            <div
              className="font-display leading-none font-extrabold tabular-nums"
              style={{
                fontSize: "clamp(2.25rem,12vw,3rem)",
                color: s.color,
                textShadow: `0 0 24px ${s.color}55`,
              }}
            >
              {s.value}
            </div>
            <div className="mt-2 font-mono text-[0.7rem] tracking-[0.12em] text-white/70 uppercase">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
