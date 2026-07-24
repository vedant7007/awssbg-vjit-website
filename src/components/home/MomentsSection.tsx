"use client";

import dynamic from "next/dynamic";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";

/**
 * "Moments" — the dome gallery. Heavy interactive client component, loaded only
 * when this section is reached and never on the server.
 */
const DomeGallery = dynamic(() => import("@/components/gallery/DomeGallery"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden />,
});

/**
 * Real event photos, optimised into `public/gallery/`. The dome repeats them
 * across its tiles, so a dozen shots fill the whole sphere. Add more by
 * dropping optimised files in and extending the count.
 */
const GALLERY_IMAGES = Array.from({ length: 14 }, (_, i) => ({
  src: `/gallery/g${String(i + 1).padStart(2, "0")}.jpg`,
  alt: `AWS SBG VJIT event moment ${i + 1}`,
}));

export function MomentsSection() {
  return (
    <section className="relative overflow-hidden bg-[#080a10] pt-16 pb-6 lg:pt-20">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow-pixel mb-4 text-white/70">{"// moments"}</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.035em] text-balance text-white">
            The room, when it&apos;s full.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Real photos from our sessions — drag the dome to look around.
          </p>
        </Reveal>
      </Container>

      {/* Full-bleed and tall so the sphere dominates instead of floating in
          dead space. Negative top margin pulls it up under the heading. */}
      <div className="-mt-4 h-[68vh] min-h-[460px] w-full sm:h-[76vh] lg:-mt-8 lg:h-[82vh]">
        <DomeGallery
          images={GALLERY_IMAGES}
          fit={0.7}
          grayscale={false}
          overlayBlurColor="#080a10"
          imageBorderRadius="2px"
          openedImageBorderRadius="4px"
          openedImageWidth="min(80vw, 460px)"
          openedImageHeight="min(80vw, 460px)"
        />
      </div>
    </section>
  );
}
