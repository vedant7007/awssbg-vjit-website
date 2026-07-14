import { PerspectiveGrid } from "@/components/motion/PerspectiveGrid";

/**
 * Minimal hero: wordmark + one line over a 3D perspective grid that glows in
 * brand colors under the cursor/finger. No buttons.
 */
export function HeroGrid() {
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-[#05070c]">
      {/* Interactive grid (receives pointer events). */}
      <div className="absolute inset-0 z-0">
        <PerspectiveGrid />
      </div>

      {/* Fade the grid edges into black; never blocks pointer. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 18%, #05070c 78%)",
        }}
      />

      {/* Content sits above but lets the pointer through so the glow follows
          everywhere, even behind the text. */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h1 className="font-display text-[clamp(2.75rem,10vw,7rem)] leading-[0.95] font-bold tracking-[-0.04em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]">
          AWS SBG VJIT
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] md:text-lg">
          AWS Student Builder Group at Vidya Jyothi Institute of Technology — a
          student community learning, building, and shipping on the cloud.
        </p>
      </div>
    </section>
  );
}
