"use client";

import * as React from "react";

/**
 * A "keep the highest" number persisted to localStorage. SSR-safe: the store
 * is only ever touched inside effects and callbacks, never during render, so
 * the first client paint matches the server (best = 0) and hydration is clean.
 *
 * Returns the current best, a `submit` that keeps the larger of old/new, and a
 * `ready` flag that flips true once the stored value has been read — useful for
 * avoiding a flash of "0" before the real value loads.
 */
export function useBestScore(key: string): {
  best: number;
  submit: (value: number) => void;
  ready: boolean;
} {
  const [best, setBest] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let stored = 0;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = Number.parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed > 0) stored = parsed;
      }
    } catch {
      // Access can throw in private modes; a zeroed best is a fine fallback.
    }
    setBest(stored);
    setReady(true);
  }, [key]);

  const submit = React.useCallback(
    (value: number) => {
      setBest((prev) => {
        if (value <= prev) return prev;
        try {
          window.localStorage.setItem(key, String(value));
        } catch {
          // Persisting is best-effort; the in-memory best still updates.
        }
        return value;
      });
    },
    [key],
  );

  return { best, submit, ready };
}
