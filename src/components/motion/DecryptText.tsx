"use client";

import * as React from "react";

/**
 * "Decrypt" text: the string resolves from scrambled glyphs into the real
 * characters, locking in left-to-right, with a light glitch while it runs.
 *
 * On the homepage it waits for the logo intro to finish (window event
 * "awssbg:intro-done") so the reveal lands right as the hero appears; elsewhere
 * (or after a safety timeout) it just runs on mount. SSR renders the final text
 * and aria-label carries it, so it's accessible and no-JS safe.
 */

const GLYPHS = "ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789#%&*<>/\\{}[]=+§▓▒░";

type WindowWithIntro = Window & { __awssbgIntroDone?: boolean };

export function DecryptText({
  text,
  className,
  duration = 2600,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }

    const chars = text.split("");
    // Each non-space char locks in at a staggered time.
    const lockAt = chars.map(
      (_, i) => (i / chars.length) * duration * 0.72 + 160,
    );
    const rand = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]!;

    // Freeze in a scrambled state until the reveal is triggered (avoids a flash
    // of the final text). Lock the width first so the layout never jumps.
    el.style.display = "inline-block";
    el.style.minWidth = `${el.offsetWidth}px`;
    el.textContent = chars.map((c) => (c === " " ? " " : rand())).join("");

    let raf = 0;
    let startT = 0;
    let running = false;

    const frame = (t: number) => {
      if (!startT) startT = t;
      const e = t - startT;
      let out = "";
      let done = true;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i]!;
        if (c === " ") out += " ";
        else if (e >= lockAt[i]!) out += c;
        else {
          out += rand();
          done = false;
        }
      }
      el.textContent = out;
      if (!done && e < duration + 200) {
        raf = requestAnimationFrame(frame);
      } else {
        el.textContent = text;
        el.style.minWidth = "";
        el.style.display = "";
        el.classList.remove("decrypting");
      }
    };

    const run = () => {
      if (running) return;
      running = true;
      el.classList.add("decrypting");
      raf = requestAnimationFrame(frame);
    };

    let fallback = 0;
    const onDone = () => {
      window.clearTimeout(fallback);
      window.removeEventListener("awssbg:intro-done", onDone);
      run();
    };

    if ((window as WindowWithIntro).__awssbgIntroDone) {
      run();
    } else {
      window.addEventListener("awssbg:intro-done", onDone);
      fallback = window.setTimeout(onDone, 4500);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.removeEventListener("awssbg:intro-done", onDone);
    };
  }, [text, duration]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  );
}
