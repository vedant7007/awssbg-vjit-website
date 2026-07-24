"use client";

import * as React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

/**
 * The 3D badge is the one heavy thing on this site: ~2.4MB of GLB plus the
 * rapier physics WASM. It is loaded only on this route, only after mount, and
 * only on pointer-capable desktop viewports — everywhere else the same badge
 * renders as a flat image, which is what the canvas draws anyway.
 */
const Lanyard = dynamic(() => import("./lanyard/Lanyard"), {
  ssr: false,
  loading: () => <BadgeFallback />,
});

const FRONT = "/lanyard/ruthvik-front.png";
const BACK = "/lanyard/ruthvik-back.png";

function useInteractive3D(): boolean {
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setOk(wide.matches && fine.matches && !calm.matches);
    update();

    wide.addEventListener("change", update);
    fine.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      fine.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  return ok;
}

function BadgeFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <Image
        src={FRONT}
        alt="Ruthvik — Group Leader, AWS SBG VJIT"
        width={330}
        height={515}
        priority={false}
        className="h-auto w-[220px] rounded-2xl shadow-2xl shadow-black/50 sm:w-[260px]"
      />
    </div>
  );
}

/**
 * On desktop the canvas is full-bleed across the whole section rather than a
 * boxed column, so the badge can be thrown anywhere in the band instead of
 * hitting an invisible wall. The copy beside it sits on a higher layer and
 * only re-enables pointer events on the links themselves.
 */
const CAM_Z = 11.8;
const FOV = 20;
/** Where the badge should hang, as a fraction of the canvas width. */
const BADGE_X = 0.22;
const ANCHOR_Y = 3.17;

/**
 * The canvas is full-bleed so the badge can be thrown across the whole band,
 * but that means its position is in world units while the copy beside it is in
 * a CSS grid — the two scale differently, and a hardcoded offset only lines up
 * at one viewport width. So derive the offset from the measured canvas each
 * time it resizes, which pins the badge to BADGE_X at any resolution.
 */
function useAnchor(
  ref: React.RefObject<HTMLDivElement | null>,
): [number, number] {
  const [x, setX] = React.useState(-2.45);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const visibleH = 2 * CAM_Z * Math.tan((FOV / 2) * (Math.PI / 180));
      const visibleW = visibleH * (width / height);
      setX((BADGE_X - 0.5) * visibleW);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return [x, ANCHOR_Y];
}

export function CaptainLanyard() {
  const interactive = useInteractive3D();
  const ref = React.useRef<HTMLDivElement>(null);
  const anchor = useAnchor(ref);

  if (!interactive) return <BadgeFallback />;

  return (
    <div ref={ref} className="absolute inset-0 z-0">
      <Lanyard
        position={[0, 0.32, CAM_Z]}
        gravity={[0, -40, 0]}
        fov={FOV}
        transparent
        frontImage={FRONT}
        backImage={BACK}
        imageFit="cover"
        lanyardWidth={0.5}
        anchor={anchor}
      />
      <p className="text-muted-foreground pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[0.65rem] tracking-[0.18em] uppercase opacity-50">
        Drag the badge anywhere
      </p>
    </div>
  );
}
