"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import { Camera, Settings2, Download, Trash2 } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { useUser } from "@/lib/auth/client";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { RollingText } from "@/components/motion/RollingText";
import { Button } from "@/components/ui/button";
import { BoothCapture } from "@/components/booth/BoothCapture";
import { useBoothPhotos } from "@/components/booth/useBoothPhotos";
import { deleteBoothPhotoAction } from "@/app/admin/booth/actions";

/**
 * "Live moments" — the photo globe. Empty, it spins branded AWS-blue tiles;
 * as students add photos at the stall each one lands on it in real time.
 */
const DomeGallery = dynamic(() => import("@/components/gallery/DomeGallery"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden />,
});

/** Branded placeholder tile — AWS in blue. Fills the globe until real photos
 * arrive, and pads the gaps once they do. */
const PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">` +
    `<rect width="400" height="400" fill="#0a1220"/>` +
    `<text x="200" y="205" font-family="Arial, sans-serif" font-size="118" font-weight="800" fill="#43B4FF" text-anchor="middle">AWS</text>` +
    `<text x="200" y="262" font-family="Arial, sans-serif" font-size="26" letter-spacing="10" fill="#3a4a63" text-anchor="middle">SBG</text>` +
    `</svg>`,
)}`;

export function MomentsSection() {
  const live = useBoothPhotos(40);
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    user
      .getIdTokenResult()
      .then((r) => setIsAdmin(r.claims.admin === true))
      .catch(() => setIsAdmin(false));
  }, [user]);

  // The dome has this many tiles (segments 35 × 5 rows). We build an array of
  // exactly this length so DomeGallery doesn't cycle-repeat: each real photo
  // lands on ONE tile, spread evenly, and AWS-blue placeholders fill the rest.
  const TILE_COUNT = 175;
  const images = React.useMemo(() => {
    const ph = { src: PLACEHOLDER, alt: "AWS SBG VJIT" };
    const arr: { src: string; alt: string }[] = Array.from(
      { length: TILE_COUNT },
      () => ph,
    );
    const n = live.length;
    if (n > 0) {
      const step = Math.max(1, Math.floor(TILE_COUNT / n));
      live.forEach((p, i) => {
        arr[(i * step) % TILE_COUNT] = { src: p.url, alt: p.alt };
      });
    }
    return arr;
  }, [live]);

  // The photo currently enlarged on the globe (a real booth photo, not the
  // placeholder) — drives the download/delete toolbar.
  const [openedSrc, setOpenedSrc] = React.useState<string | null>(null);
  const opened = openedSrc
    ? (live.find((p) => p.url === openedSrc) ?? null)
    : null;

  const downloadOpened = () => {
    if (!opened) return;
    const a = document.createElement("a");
    a.href = opened.url;
    a.download = "aws-sbg-vjit.jpg";
    a.click();
  };

  const deleteOpened = () => {
    if (!opened) return;
    const id = opened.id;
    setOpenedSrc(null);
    deleteBoothPhotoAction(id)
      .then((r) =>
        r.ok
          ? toast.success("Photo removed from the globe.")
          : toast.error(r.error ?? "Couldn't delete."),
      )
      .catch(() => toast.error("Couldn't delete."));
  };

  return (
    <section className="relative overflow-hidden bg-[var(--band)] pt-16 pb-6 lg:pt-20">
      <Container className="relative z-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="border-border/60 bg-background/60 text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.7rem] tracking-[0.14em] uppercase">
            <span className="relative flex size-2">
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-success relative inline-flex size-2 rounded-full" />
            </span>
            Live
          </span>
          <RollingText
            as="h2"
            text="Live moments"
            className="font-display text-foreground text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.95] font-bold tracking-[-0.035em] text-balance"
          />
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-base leading-relaxed">
            Snap a photo at our stall and watch it land on the globe in real
            time — then drag it around and find yourself.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <BoothCapture
              trigger={
                <Button size="lg" className="glow-pill rounded-full px-8">
                  <Camera className="size-5" />
                  Add your photo
                </Button>
              }
            />
            {isAdmin ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link href={routes.adminBooth}>
                  <Settings2 className="size-4" />
                  Manage
                </Link>
              </Button>
            ) : null}
          </div>
        </Reveal>
      </Container>

      {/* Full-bleed and tall so the sphere dominates. */}
      <div className="-mt-4 h-[68vh] min-h-[460px] w-full sm:h-[76vh] lg:-mt-8 lg:h-[82vh]">
        <DomeGallery
          images={images}
          segments={35}
          fit={0.7}
          grayscale={false}
          overlayBlurColor="var(--band)"
          imageBorderRadius="4px"
          openedImageBorderRadius="8px"
          openedImageWidth="min(80vw, 460px)"
          openedImageHeight="min(80vw, 460px)"
          onOpen={setOpenedSrc}
        />
      </div>

      {/* Toolbar for the photo open on the globe: download for anyone, delete
          for admins. */}
      {opened ? (
        <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
          <div className="glass flex items-center gap-2 rounded-full border p-1.5 shadow-lg">
            <Button onClick={downloadOpened} size="sm" className="rounded-full">
              <Download className="size-4" />
              Download
            </Button>
            {isAdmin ? (
              <Button
                onClick={deleteOpened}
                size="sm"
                variant="destructive"
                className="rounded-full"
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
