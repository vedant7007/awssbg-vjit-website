import { Aurora } from "@/components/motion/Aurora";

/**
 * Minimal hero: wordmark + one line, centered over a subtle Aurora glow on a
 * near-black field. A static CSS glow sits behind the shader so the hero is
 * never pure black, even if a device's WebGL misbehaves. No buttons.
 */
export function HeroAurora() {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center justify-center overflow-hidden bg-[#080b12]">
      <div className="absolute inset-0 -z-10">
        {/* Static fallback glow. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 50% 12%, rgba(255,153,0,0.13), transparent 70%), radial-gradient(45% 40% at 72% 8%, rgba(67,180,255,0.10), transparent 70%)",
          }}
        />
        {/* Animated aurora, softened. */}
        <Aurora className="[mask-image:linear-gradient(to_bottom,transparent,black_15%,black_60%,transparent)] opacity-70" />
        {/* Ease the bottom edge into the page. */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#080b12]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h1 className="font-display text-[clamp(2.75rem,10vw,7rem)] leading-[0.95] font-bold tracking-[-0.04em] text-white">
          AWS SBG VJIT
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
          AWS Student Builder Group at Vidya Jyothi Institute of Technology — a
          student community learning, building, and shipping on the cloud.
        </p>
      </div>
    </section>
  );
}
