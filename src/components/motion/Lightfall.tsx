import * as React from "react";

/**
 * Lightfall — orange/blue light streaks raining on a dark field, done with pure
 * CSS transforms/opacity (see .lf-streak + @keyframes lf-fall in globals.css).
 * No WebGL, no per-frame JS: renders everywhere and stays smooth on mobile.
 * Sits behind the hero; reduced-motion freezes the streaks (they fade out).
 */

const ORANGE = "#ff9900";
const BLUE = "#43b4ff";
const LIGHT = "#ffc061";

type Streak = {
  left: number; // %
  w: number; // px
  h: number; // vh
  o: number; // peak opacity
  dur: number; // s
  delay: number; // s
  blur: number; // px
  c: string;
};

// Hand-tuned, deterministic spread so SSR and client match.
const STREAKS: Streak[] = [
  { left: 5, w: 1, h: 42, o: 0.55, dur: 7.5, delay: 0, blur: 0.5, c: ORANGE },
  { left: 12, w: 1.5, h: 30, o: 0.3, dur: 9.5, delay: 3.2, blur: 1.5, c: BLUE },
  { left: 19, w: 1, h: 38, o: 0.45, dur: 8.2, delay: 1.4, blur: 0.5, c: LIGHT },
  { left: 26, w: 2, h: 26, o: 0.25, dur: 11, delay: 5, blur: 2, c: ORANGE },
  { left: 33, w: 1, h: 46, o: 0.6, dur: 6.8, delay: 2.1, blur: 0.5, c: ORANGE },
  { left: 41, w: 1.5, h: 34, o: 0.35, dur: 9, delay: 4.4, blur: 1.5, c: BLUE },
  { left: 48, w: 1, h: 40, o: 0.5, dur: 7.8, delay: 0.6, blur: 0.5, c: LIGHT },
  { left: 55, w: 1, h: 30, o: 0.4, dur: 10, delay: 3.8, blur: 1, c: ORANGE },
  { left: 62, w: 2, h: 24, o: 0.22, dur: 12, delay: 1.1, blur: 2.5, c: BLUE },
  { left: 69, w: 1, h: 44, o: 0.58, dur: 7, delay: 4.9, blur: 0.5, c: ORANGE },
  {
    left: 76,
    w: 1.5,
    h: 32,
    o: 0.32,
    dur: 9.2,
    delay: 2.6,
    blur: 1.5,
    c: LIGHT,
  },
  {
    left: 83,
    w: 1,
    h: 38,
    o: 0.48,
    dur: 8.5,
    delay: 0.3,
    blur: 0.5,
    c: ORANGE,
  },
  { left: 90, w: 1, h: 28, o: 0.35, dur: 10.5, delay: 5.4, blur: 1, c: BLUE },
  { left: 96, w: 1.5, h: 40, o: 0.5, dur: 7.6, delay: 2.9, blur: 1, c: ORANGE },
];

export function Lightfall({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {/* Ambient glow pooling toward the top. */}
      <div
        className="absolute -top-1/3 left-1/2 h-[80%] w-[120%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(50% 55% at 50% 40%, rgba(255,153,0,0.18), transparent 70%), radial-gradient(45% 50% at 35% 30%, rgba(67,180,255,0.14), transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Falling streaks. */}
      {STREAKS.map((s, i) => (
        <span
          key={i}
          className="lf-streak"
          style={
            {
              left: `${s.left}%`,
              width: `${s.w}px`,
              height: `${s.h}vh`,
              filter: `blur(${s.blur}px)`,
              background: `linear-gradient(to bottom, transparent, ${s.c}, transparent)`,
              boxShadow: `0 0 ${6 + s.w * 3}px ${s.c}`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              "--lf-o": s.o,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
