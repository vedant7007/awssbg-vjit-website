/**
 * The canonical, absolute site origin — used for metadata, robots and sitemap.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL when it's a real (non-localhost) URL,
 *   2. Vercel's production domain at build/runtime,
 *   3. the known production domain as a last resort.
 *
 * This guarantees we never emit a `localhost` URL to crawlers, even if the
 * env var is left at its dev default.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && !explicit.includes("localhost")) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "https://aws-sbg-vjit.vercel.app";
}

export const SITE_URL = resolveSiteUrl();
