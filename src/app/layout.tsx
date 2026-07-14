import type { Metadata, Viewport } from "next";

import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

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
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
