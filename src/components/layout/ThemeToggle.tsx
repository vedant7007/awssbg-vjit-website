"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils/cn";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

/**
 * Theme toggle that reveals the new theme with an expanding circular "wave"
 * from the click point (View Transitions API). Falls back to an instant switch
 * where the API is unavailable or reduced motion is requested.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const doc = document as DocumentWithViewTransition;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (typeof doc.startViewTransition !== "function" || reduce) {
      setTheme(next);
      return;
    }

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          // Percentages resolve against the snapshot box, so this is exactly
          // centred on every viewport — no scrollbar / mobile-chrome offset.
          // 75% clears the ~70.7% needed to reach a corner.
          clipPath: ["circle(0% at 50% 50%)", "circle(75% at 50% 50%)"],
        },
        {
          duration: 950,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={toggle}
      aria-label={
        mounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      className={cn(
        "text-foreground/70 hover:text-foreground hover:bg-foreground/10 focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      {mounted && isDark ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}
