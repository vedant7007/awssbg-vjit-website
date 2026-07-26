"use client";

import * as React from "react";

import { logger } from "@/lib/utils/logger";

/**
 * Root error boundary. This replaces the entire document (including the root
 * layout) when an error escapes it, so it must render its own <html>/<body>
 * and cannot rely on the app's providers, theme, or global styles. Kept fully
 * self-contained with inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    logger.error("global error boundary", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#0b0f17",
          color: "#fafaf7",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <p
            style={{
              color: "#ff9900",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: "0 0 0.9rem",
            }}
          >
            The site hit an unexpected error.
          </h1>
          <p
            style={{ color: "#8b93a1", lineHeight: 1.6, margin: "0 0 1.75rem" }}
          >
            We&apos;ve logged it. Try reloading — if it keeps happening, let a
            core member know.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "999px",
              border: "none",
              background: "#ff9900",
              color: "#161d27",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
