"use client";

import * as React from "react";

/**
 * The site's signature: a living constellation of nodes (members + AWS services)
 * drifting and wiring themselves together, with pulsing orange/blue edges. Sits
 * behind the hero on a dark "console" band.
 *
 * Pure canvas 2D — no deps. Respects prefers-reduced-motion (renders a single
 * static frame), pauses when scrolled off-screen, and caps DPR for perf.
 */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** false = quiet member dot, true = labelled service hub. */
  hub: boolean;
  label: string | undefined;
  pulse: number;
};

const HUB_LABELS = ["EC2", "S3", "Lambda", "DynamoDB", "Amplify", "Bedrock"];
const ORANGE = "255, 153, 0";
const BLUE = "67, 180, 255";

export function NetworkField({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let raf = 0;
    let visible = true;

    function seed() {
      // Density scales with area but stays bounded for perf.
      const count = Math.min(
        56,
        Math.max(26, Math.round((width * height) / 26000)),
      );
      nodes = Array.from({ length: count }, (_, i) => {
        const hub = i < HUB_LABELS.length;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: hub ? 3.2 : 1.4 + Math.random() * 1.2,
          hub,
          label: hub ? HUB_LABELS[i] : undefined,
          pulse: Math.random() * Math.PI * 2,
        };
      });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Edges: connect nearby nodes, brighter as they close in.
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          const max = 150;
          if (dist < max) {
            const strength = 1 - dist / max;
            const tint = a.hub || b.hub ? ORANGE : BLUE;
            ctx!.strokeStyle = `rgba(${tint}, ${strength * 0.32})`;
            ctx!.lineWidth = a.hub || b.hub ? 1 : 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Nodes.
      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          n.pulse += 0.03;
        }
        const glow = n.hub ? 0.5 + 0.5 * Math.sin(n.pulse) : 0.6;
        const tint = n.hub ? ORANGE : BLUE;

        if (n.hub) {
          ctx!.shadowBlur = 14;
          ctx!.shadowColor = `rgba(${ORANGE}, 0.9)`;
        }
        ctx!.fillStyle = `rgba(${tint}, ${n.hub ? 0.9 : 0.55})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r + (n.hub ? glow * 1.2 : 0), 0, Math.PI * 2);
        ctx!.fill();
        ctx!.shadowBlur = 0;

        if (n.hub && n.label) {
          ctx!.font =
            "500 10px ui-monospace, 'JetBrains Mono', Consolas, monospace";
          ctx!.fillStyle = `rgba(233, 236, 241, ${0.35 + glow * 0.4})`;
          ctx!.fillText(n.label, n.x + 8, n.y + 3);
        }
      }

      if (!reduced && visible) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    // Pause the loop when the hero scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible && !reduced) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      role="presentation"
    />
  );
}
