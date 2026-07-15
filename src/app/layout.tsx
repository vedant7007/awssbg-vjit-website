import type { Metadata, Viewport } from "next";

import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { CloudTransitionProvider } from "@/components/transition/CloudTransitionProvider";
import { LogoIntro } from "@/components/preloader/LogoIntro";
import { Toaster } from "@/components/ui/sonner";

// Runs before first paint so the overlay never flashes. Plays on every load of
// the homepage; skips elsewhere and for reduced motion. LogoIntro re-checks.
const INTRO_SCRIPT = `(function(){try{var home=location.pathname==='/';var r=false;try{r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}document.documentElement.setAttribute('data-intro',(home&&!r)?'play':'skip');}catch(e){document.documentElement.setAttribute('data-intro','skip');}})();`;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AWS SBG VJIT",
    template: "%s | AWS SBG VJIT",
  },
  description:
    "AWS Student Builder Group at VJIT. A student community learning, building, and shipping on the cloud.",
  openGraph: {
    title: "AWS SBG VJIT",
    description:
      "AWS Student Builder Group at VJIT. Learn, build, and ship on the cloud.",
    url: SITE_URL,
    siteName: "AWS SBG VJIT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AWS SBG VJIT",
    description:
      "AWS Student Builder Group at VJIT. Learn, build, and ship on the cloud.",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <LogoIntro />
        <Providers>
          <CloudTransitionProvider>{children}</CloudTransitionProvider>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
