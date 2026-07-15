import { PerspectiveGrid } from "@/components/motion/PerspectiveGrid";
import { DecryptText } from "@/components/motion/DecryptText";

/**
 * Minimal hero: wordmark + one line over a 3D perspective grid that glows in
 * brand colors under the cursor/finger. Works in both light and dark themes.
 */
export function HeroGrid() {
  return (
    <section className="bg-background relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      {/* Interactive grid (receives pointer events). */}
      <div className="absolute inset-0 z-0">
        <PerspectiveGrid cols={30} rows={30} />
      </div>

      {/* Fade the grid edges into the page background; never blocks pointer. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 16%, var(--background) 76%)",
        }}
      />

      {/* Content sits above but lets the pointer through so the glow follows
          everywhere, even behind the text. */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-3xl px-6 text-center">
        <p className="font-pixel text-orange mb-7 text-[0.55rem] tracking-[0.25em] sm:text-[0.7rem]">
          AWS · STUDENT · BUILDERS
        </p>
        <h1 className="font-display text-foreground text-[clamp(2.75rem,10vw,7rem)] leading-[0.95] font-bold tracking-[-0.04em] [text-shadow:0_2px_34px_var(--background)]">
          <DecryptText text="AWS SBG VJIT" idleClassName="headline-shimmer" />
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-relaxed md:text-lg">
          AWS Student Builder Group at Vidya Jyothi Institute of Technology — a
          student community learning, building, and shipping on the cloud.
        </p>
      </div>
    </section>
  );
}
