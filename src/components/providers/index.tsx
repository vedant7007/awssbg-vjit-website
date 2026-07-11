"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { CommandPaletteProvider } from "@/components/command/CommandPalette";

/**
 * Client-side providers for the whole app: theme (light/dark), reduced-motion
 * aware Framer Motion, Lenis smooth scroll, and the global Command Palette.
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
        <LenisProvider>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </LenisProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
