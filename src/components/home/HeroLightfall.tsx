import { Lightfall } from "@/components/motion/Lightfall";

/**
 * Minimal hero: wordmark + one line, centered over the Lightfall shader on a
 * near-black field. No buttons — quiet and clean.
 */
export function HeroLightfall() {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center justify-center overflow-hidden bg-[#080b12]">
      <div className="absolute inset-0 -z-10">
        <Lightfall />
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
