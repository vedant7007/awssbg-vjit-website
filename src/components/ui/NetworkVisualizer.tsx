"use client";

import * as React from "react";
import { motion } from "framer-motion";

// Concept Node data in coordinates relative to 500x500 viewport
interface NodeInfo {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  xKeyframes: number[];
  yKeyframes: number[];
  dy: number; // Text offset direction
  subtitle: string;
}

const NODES_DATA: NodeInfo[] = [
  {
    id: "aws",
    label: "AWS",
    x: 250,
    y: 80,
    size: 8,
    duration: 11,
    xKeyframes: [250, 255, 246, 254, 247, 250],
    yKeyframes: [80, 75, 86, 77, 84, 80],
    dy: -18,
    subtitle: "Amazon Web Services Core Infrastructure",
  },
  {
    id: "cloud",
    label: "Cloud",
    x: 370,
    y: 130,
    size: 8,
    duration: 13,
    xKeyframes: [370, 376, 365, 374, 366, 370],
    yKeyframes: [130, 124, 136, 126, 134, 130],
    dy: -18,
    subtitle: "Serverless & Cloud-Native Architectures",
  },
  {
    id: "projects",
    label: "Projects",
    x: 420,
    y: 250,
    size: 8,
    duration: 12,
    xKeyframes: [420, 426, 413, 424, 416, 420],
    yKeyframes: [250, 244, 256, 246, 254, 250],
    dy: -18,
    subtitle: "Production-grade Student Prototypes",
  },
  {
    id: "community",
    label: "Community",
    x: 370,
    y: 370,
    size: 8,
    duration: 15,
    xKeyframes: [370, 375, 364, 373, 367, 370],
    yKeyframes: [370, 376, 363, 374, 366, 370],
    dy: 22,
    subtitle: "300+ Active Builders on Campus",
  },
  {
    id: "learning",
    label: "Learning",
    x: 250,
    y: 420,
    size: 8,
    duration: 10,
    xKeyframes: [250, 254, 246, 253, 247, 250],
    yKeyframes: [420, 425, 414, 423, 416, 420],
    dy: 22,
    subtitle: "Peer-led Certification Mentorship",
  },
  {
    id: "leadership",
    label: "Leadership",
    x: 130,
    y: 370,
    size: 8,
    duration: 14,
    xKeyframes: [130, 135, 124, 133, 127, 130],
    yKeyframes: [370, 364, 376, 367, 374, 370],
    dy: 22,
    subtitle: "Core Initiative Committee Teams",
  },
  {
    id: "hackathons",
    label: "Hackathons",
    x: 80,
    y: 250,
    size: 8,
    duration: 12,
    xKeyframes: [80, 86, 74, 84, 76, 80],
    yKeyframes: [250, 243, 257, 246, 254, 250],
    dy: -18,
    subtitle: "Intense Overnight Cloud Build Sprints",
  },
  {
    id: "innovation",
    label: "Innovation",
    x: 130,
    y: 130,
    size: 8,
    duration: 11,
    xKeyframes: [130, 135, 125, 133, 127, 130],
    yKeyframes: [130, 124, 136, 127, 134, 130],
    dy: -18,
    subtitle: "Exploring Cutting-Edge Technologies",
  },
];

const centerDuration = 14;
const centerXKeyframes = [250, 253, 247, 252, 248, 250];
const centerYKeyframes = [250, 247, 253, 248, 252, 250];

export function NetworkVisualizer() {
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);

  const selectedNodeInfo = React.useMemo(() => {
    if (!hoveredNode) return null;
    if (hoveredNode === "center") {
      return {
        label: "AWS Student Builder Group VJIT",
        type: "Network Hub",
        desc: "Empowering the next generation of cloud builders.",
      };
    }
    const match = NODES_DATA.find((n) => n.id === hoveredNode);
    if (!match) return null;
    return {
      label: match.label,
      type: "Concept Node",
      desc: match.subtitle,
    };
  }, [hoveredNode]);

  return (
    <div className="border-border/80 bg-card/40 relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-sm border p-4 pb-24 select-none">
      {/* Background visual orbit tracks */}
      <div className="from-orange/5 to-purple/5 pointer-events-none absolute inset-0 bg-gradient-to-tr via-transparent opacity-40" />

      <svg
        className="text-orange h-full w-full"
        viewBox="0 0 500 500"
        fill="none"
        stroke="currentColor"
      >
        {/* Orbital rings */}
        <circle
          cx="250"
          cy="250"
          r="170"
          stroke="rgba(255, 153, 0, 0.05)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3 3"
        />
        <circle
          cx="250"
          cy="250"
          r="100"
          stroke="rgba(255, 153, 0, 0.03)"
          strokeWidth="1"
          fill="none"
        />

        {/* Grid helper lines (extremely faint) */}
        <line
          x1="250"
          y1="50"
          x2="250"
          y2="450"
          stroke="rgba(255, 153, 0, 0.02)"
          strokeWidth="0.5"
        />
        <line
          x1="50"
          y1="250"
          x2="450"
          y2="250"
          stroke="rgba(255, 153, 0, 0.02)"
          strokeWidth="0.5"
        />

        {/* 1. Connection lines (Edges) */}
        {NODES_DATA.map((node) => {
          const isCurrentHovered = hoveredNode === node.id;
          const isCenterHovered = hoveredNode === "center";
          const isActiveConnection = isCurrentHovered || isCenterHovered;

          return (
            <motion.line
              key={`edge-${node.id}`}
              animate={{
                x1: centerXKeyframes,
                y1: centerYKeyframes,
                x2: node.xKeyframes,
                y2: node.yKeyframes,
              }}
              transition={{
                x1: {
                  duration: centerDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                y1: {
                  duration: centerDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x2: {
                  duration: node.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                y2: {
                  duration: node.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              stroke="var(--color-orange)"
              strokeWidth={isActiveConnection ? 2.5 : 1}
              strokeOpacity={
                isActiveConnection ? 1.0 : hoveredNode ? 0.12 : 0.35
              }
              strokeDasharray={isActiveConnection ? "4,4" : "6,6"}
              className="transition-all duration-300"
              style={{
                filter: isActiveConnection
                  ? "drop-shadow(0 0 4px rgba(255,153,0,0.5))"
                  : "none",
              }}
            />
          );
        })}

        {/* 2. Surrounding Nodes (Circles) */}
        {NODES_DATA.map((node) => {
          const isCurrentHovered = hoveredNode === node.id;
          const opacity = hoveredNode && !isCurrentHovered ? 0.4 : 1.0;

          return (
            <g key={`node-group-${node.id}`} className="cursor-pointer">
              {/* Invisible interactive zone for hover buffer */}
              <motion.circle
                animate={{
                  cx: node.xKeyframes,
                  cy: node.yKeyframes,
                }}
                transition={{
                  cx: {
                    duration: node.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  cy: {
                    duration: node.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                r={24}
                fill="transparent"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />

              {/* Visual Node */}
              <motion.circle
                animate={{
                  cx: node.xKeyframes,
                  cy: node.yKeyframes,
                  r: isCurrentHovered ? node.size * 1.3 : node.size,
                }}
                transition={{
                  cx: {
                    duration: node.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  cy: {
                    duration: node.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  r: { duration: 0.2 },
                }}
                fill={
                  isCurrentHovered
                    ? "var(--color-orange)"
                    : "var(--color-background)"
                }
                stroke="var(--color-orange)"
                strokeWidth={2}
                style={{
                  opacity,
                  filter: isCurrentHovered
                    ? "drop-shadow(0 0 10px var(--color-orange))"
                    : "drop-shadow(0 0 3px rgba(255,153,0,0.3))",
                }}
                className="transition-opacity duration-300"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />

              {/* Node Labels */}
              <motion.text
                animate={{
                  x: node.xKeyframes,
                  y: node.yKeyframes,
                }}
                transition={{
                  x: {
                    duration: node.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  y: {
                    duration: node.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                dy={node.dy}
                textAnchor="middle"
                className="fill-foreground/95 pointer-events-none font-mono text-[9px] font-extrabold tracking-wider transition-all duration-300 select-none"
                style={{
                  opacity,
                  fill: isCurrentHovered
                    ? "var(--color-orange)"
                    : "var(--color-foreground)",
                }}
              >
                {node.label}
              </motion.text>
            </g>
          );
        })}

        {/* 3. Center Hub Node */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => setHoveredNode("center")}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {/* Invisible padding hover buffer */}
          <motion.circle
            animate={{
              cx: centerXKeyframes,
              cy: centerYKeyframes,
            }}
            transition={{
              cx: {
                duration: centerDuration,
                repeat: Infinity,
                ease: "easeInOut",
              },
              cy: {
                duration: centerDuration,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            r={60}
            fill="transparent"
          />

          {/* Central Hub Circle */}
          <motion.circle
            animate={{
              cx: centerXKeyframes,
              cy: centerYKeyframes,
              r: hoveredNode === "center" ? 48 : 42,
            }}
            transition={{
              cx: {
                duration: centerDuration,
                repeat: Infinity,
                ease: "easeInOut",
              },
              cy: {
                duration: centerDuration,
                repeat: Infinity,
                ease: "easeInOut",
              },
              r: { duration: 0.25 },
            }}
            fill="var(--color-card)"
            stroke="var(--color-orange)"
            strokeWidth={2.5}
            style={{
              filter:
                hoveredNode === "center"
                  ? "drop-shadow(0 0 16px var(--color-orange))"
                  : "drop-shadow(0 0 6px rgba(255,153,0,0.3))",
            }}
          />

          {/* Central Typography lines */}
          <motion.text
            animate={{ x: centerXKeyframes, y: centerYKeyframes }}
            transition={{
              duration: centerDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            textAnchor="middle"
            className="fill-foreground pointer-events-none font-mono text-[9px] font-bold tracking-wider select-none"
            style={{ transform: "translateY(-4px)" }}
          >
            AWS SBG
          </motion.text>
          <motion.text
            animate={{ x: centerXKeyframes, y: centerYKeyframes }}
            transition={{
              duration: centerDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            textAnchor="middle"
            className="fill-orange pointer-events-none font-mono text-[8px] font-black tracking-widest select-none"
            style={{ transform: "translateY(8px)" }}
          >
            VJIT
          </motion.text>
        </g>
      </svg>

      {/* Explorer Overlay Panel */}
      <div className="bg-paper-warm/85 border-border/80 absolute right-3 bottom-3 left-3 flex min-h-[58px] flex-col justify-center rounded-sm border px-4 py-2.5 backdrop-blur-md transition-all duration-300">
        {selectedNodeInfo ? (
          <div className="space-y-0.5">
            <span className="text-orange font-mono text-[8px] font-bold tracking-widest uppercase">
              {selectedNodeInfo.type}
            </span>
            <h4 className="font-display text-foreground text-xs leading-snug font-bold">
              {selectedNodeInfo.label}
            </h4>
            <p className="text-muted-foreground text-[10px] leading-tight">
              {selectedNodeInfo.desc}
            </p>
          </div>
        ) : (
          <div className="text-muted-foreground animate-pulse py-1.5 text-center font-mono text-[10px] tracking-wider uppercase">
            ★ Hover nodes to explore ecosystem
          </div>
        )}
      </div>
    </div>
  );
}
