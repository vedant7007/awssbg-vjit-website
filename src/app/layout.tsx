import type { Metadata, Viewport } from "next";

import "./globals.css";
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
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AWS Student Builder Group VJIT",
    url: SITE_URL,
    logo: `${SITE_URL}/brand-assets/logo.png`,
    sameAs: ["https://github.com/aws-sbg-vjit"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AWS Student Builder Group VJIT",
    url: SITE_URL,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background font-display text-foreground min-h-dvh antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
