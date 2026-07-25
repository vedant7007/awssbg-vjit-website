"use client";

import * as React from "react";
import { stagger, useAnimate } from "framer-motion";

/**
 * Smooth per-character rolling text (odometer / "roll up" reveal, Skiper-style).
 *
 * Each glyph sits in an overflow-masked column holding two identical copies. A
 * roll translates the column up by one line so the second copy takes the first
 * one's place — seamless because the copies match — then snaps back, ready to
 * roll again. Characters are staggered, so the word rolls as a left-to-right
 * wave.
 *
 * Triggers (default `auto`): once when it scrolls into view, again on hover,
 * and on its own at random intervals so headlines across the page keep quietly
 * rolling at different moments. Off-screen / hidden-tab instances stay still.
 *
 * The real text is the accessible name (`aria-label`); the animated glyph rows
 * are `aria-hidden`, and SSR renders the settled text so there's no layout
 * shift and crawlers read it plainly. Reduced motion → static text.
 */

type Trigger = "auto" | "hover" | "inview";

export function RollingText({
  text,
  as: Tag = "span",
  className,
  trigger = "auto",
  duration = 0.55,
  charStagger = 0.028,
  startDelay = 0,
}: {
  text: string;
  as?: React.ElementType;
  className?: string;
  /** `auto`: inview + hover + random recurring. `hover`: only on hover. `inview`: once. */
  trigger?: Trigger;
  duration?: number;
  charStagger?: number;
  /** ms to wait after entering view before the first roll. */
  startDelay?: number;
}) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const rolling = React.useRef(false);

  const words = React.useMemo(() => text.split(" "), [text]);

  const roll = React.useCallback(async () => {
    if (rolling.current || !scope.current) return;
    rolling.current = true;
    await animate(
      ".rt-inner",
      { y: "-50%" },
      { duration, ease: [0.76, 0, 0.24, 1], delay: stagger(charStagger) },
    );
    // Snap back instantly; the two copies are identical so nothing flickers.
    await animate(".rt-inner", { y: "0%" }, { duration: 0 });
    rolling.current = false;
  }, [animate, scope, duration, charStagger]);

  React.useEffect(() => {
    const el = scope.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let started = false;
    let recurTimer = 0;
    let firstTimer = 0;
    let io: IntersectionObserver | null = null;

    const scheduleRecur = () => {
      if (trigger !== "auto") return;
      const wait = 6500 + Math.random() * 11000;
      recurTimer = window.setTimeout(() => {
        // Only roll when the tab is visible and the text is on-screen.
        if (!document.hidden) void roll();
        scheduleRecur();
      }, wait);
    };

    const begin = () => {
      if (started) return;
      started = true;
      firstTimer = window.setTimeout(() => {
        void roll();
        scheduleRecur();
      }, startDelay);
    };

    if (trigger === "hover") {
      // No auto-start; hover handler below drives it.
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              begin();
              io?.disconnect();
              break;
            }
          }
        },
        { rootMargin: "-8% 0px -8% 0px" },
      );
      io.observe(el);
    }

    return () => {
      clearTimeout(recurTimer);
      clearTimeout(firstTimer);
      io?.disconnect();
    };
  }, [roll, trigger, startDelay, scope]);

  const onHover = React.useCallback(() => {
    if (trigger === "inview") return;
    void roll();
  }, [roll, trigger]);

  const inner = (
    <span
      ref={scope}
      aria-hidden="true"
      className="rt-root"
      onMouseEnter={onHover}
    >
      {words.map((word, wi) => (
        <React.Fragment key={`${word}-${wi}`}>
          <span className="rt-word">
            {Array.from(word).map((ch, ci) => (
              <span key={ci} className="rt-char">
                <span className="rt-inner">
                  <span className="rt-face">{ch}</span>
                  <span className="rt-face">{ch}</span>
                </span>
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );

  return React.createElement(Tag, { className, "aria-label": text }, inner);
}
