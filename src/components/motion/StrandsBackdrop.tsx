"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { PerspectiveGrid } from "@/components/motion/PerspectiveGrid";

/**
 * WebGL "strands" backdrop for the closing CTA — but only on pointer-capable
 * desktops. OGL WebGL is exactly what lagged mobile last time, so phones and
 * reduced-motion users get the lightweight perspective grid instead and never
 * load the shader. Lazy + ssr:false keeps it out of the initial bundle.
 */
const Strands = dynamic(() => import("@/components/motion/strands/Strands"), {
  ssr: false,
  loading: () => null,
});

const BRAND_COLORS = ["#FF9900", "#FF57EA", "#43B4FF", "#AD5CFF"];

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

export function StrandsBackdrop() {
  const desktop = useDesktopMotion();

  if (!desktop) {
    return <PerspectiveGrid cols={30} rows={30} />;
  }

  return (
    <Strands
      colors={BRAND_COLORS}
      count={3}
      speed={0.4}
      amplitude={1.1}
      glow={2.4}
      intensity={0.55}
      className="h-full w-full"
    />
  );
}
