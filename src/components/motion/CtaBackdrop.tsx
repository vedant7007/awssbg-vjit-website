"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { PerspectiveGrid } from "@/components/motion/PerspectiveGrid";

/**
 * PixelBlast backdrop for the closing CTA — desktop + pointer only. WebGL is
 * what lagged mobile before, so phones and reduced-motion users get the light
 * CSS grid and never load the shader. Lazy + ssr:false keeps it out of the
 * initial bundle.
 */
const PixelBlast = dynamic(() => import("@/components/motion/PixelBlast"), {
  ssr: false,
  loading: () => null,
});

function useDesktopMotion(): boolean {
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

export function CtaBackdrop() {
  const desktop = useDesktopMotion();
  if (!desktop) return <PerspectiveGrid cols={30} rows={30} />;
  return (
    <PixelBlast
      variant="circle"
      pixelSize={6}
      color="#FF9900"
      patternScale={3}
      patternDensity={1.1}
      pixelSizeJitter={0.4}
      enableRipples
      rippleSpeed={0.4}
      rippleThickness={0.12}
      rippleIntensityScale={1.4}
      speed={0.5}
      edgeFade={0.3}
      transparent
    />
  );
}
