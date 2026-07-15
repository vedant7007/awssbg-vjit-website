import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Inter,
  Press_Start_2P,
} from "next/font/google";

/**
 * Type system for the site.
 * - display: Bricolage Grotesque — characterful modern grotesque for headlines.
 * - mono/duo: JetBrains Mono — terminal eyebrows, the blinking caret, data + handles.
 * - body: Inter — quiet, readable long-form.
 * - pixel: Press Start 2P — wordmark + tiny labels, echoing the pixel logo.
 * Each exposes a CSS variable consumed by @theme in globals.css.
 */
export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
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

// Pixel accent face — used for the wordmark and small labels, echoing the
// pixelated logo. Kept to short strings; it's not a reading face.
export const fontPixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pressstart",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontMono.variable} ${fontBody.variable} ${fontPixel.variable}`;
