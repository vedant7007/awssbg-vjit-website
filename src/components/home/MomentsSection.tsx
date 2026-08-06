"use client";

import dynamic from "next/dynamic";
import { Camera } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { RollingText } from "@/components/motion/RollingText";
import { Button } from "@/components/ui/button";
import { BoothCapture } from "@/components/booth/BoothCapture";
import { useBoothPhotos } from "@/components/booth/useBoothPhotos";

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
  const live = useBoothPhotos(30);
  // Freshest booth photos lead; the event photos fill out the rest of the
  // sphere so it always looks full, even before anyone's added one.
  const images = live.length
    ? [...live.map((p) => ({ src: p.url, alt: p.alt })), ...GALLERY_IMAGES]
    : GALLERY_IMAGES;

  return (
    <section className="relative overflow-hidden bg-[var(--band)] pt-16 pb-6 lg:pt-20">
      <Container className="relative z-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow-pixel text-muted-foreground mb-4">
            {"// moments"}
          </p>
          <RollingText
            as="h2"
            text={"The room, when it's full."}
            className="font-display text-foreground text-[clamp(2rem,5vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.035em] text-balance"
          />
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Real photos from our sessions — and yours. Add yourself and watch it
            land on the globe live.
          </p>
          <div className="mt-6">
            <BoothCapture
              trigger={
                <Button size="lg" className="glow-pill rounded-full px-8">
                  <Camera className="size-5" />
                  Add your photo
                </Button>
              }
            />
          </div>
        </Reveal>
      </Container>

      {/* Full-bleed and tall so the sphere dominates instead of floating in
          dead space. Negative top margin pulls it up under the heading. */}
      <div className="-mt-4 h-[68vh] min-h-[460px] w-full sm:h-[76vh] lg:-mt-8 lg:h-[82vh]">
        <DomeGallery
          images={images}
          fit={0.7}
          grayscale={false}
          overlayBlurColor="var(--band)"
          imageBorderRadius="2px"
          openedImageBorderRadius="4px"
          openedImageWidth="min(80vw, 460px)"
          openedImageHeight="min(80vw, 460px)"
        />
      </div>
    </section>
  );
}
