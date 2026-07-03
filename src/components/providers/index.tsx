"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { LenisProvider } from "@/components/motion/LenisProvider";

/**
 * Client-side providers for the whole app: theme (light/dark), reduced-motion
 * aware Framer Motion, and Lenis smooth scroll.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <LenisProvider>{children}</LenisProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
