import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";

/**
 * Type system for the site.
 * - display: Space Grotesk — techy, geometric, oversized headlines (the editorial voice).
 * - mono/duo: JetBrains Mono — terminal eyebrows, the blinking caret, data + handles.
 * - body: Inter — quiet, readable long-form.
 * Each exposes a CSS variable consumed by @theme in globals.css.
 */
export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jbmono",
  display: "swap",
});

export const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontMono.variable} ${fontBody.variable}`;
