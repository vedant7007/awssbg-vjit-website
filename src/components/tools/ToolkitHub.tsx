"use client";

import * as React from "react";
import {
  Braces,
  Calculator,
  FileText,
  ImageIcon,
  ServerCog,
  Shrink,
  Wand2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/motion/Reveal";
import { type ToolProps } from "@/components/tools/shared";
import { ImageConverter } from "@/components/tools/ImageConverter";
import { ImageCompressor } from "@/components/tools/ImageCompressor";
import { ReadmeGenerator } from "@/components/tools/ReadmeGenerator";
import { AwsCostEstimator } from "@/components/tools/AwsCostEstimator";
import { JsonFormatter } from "@/components/tools/JsonFormatter";
import { EncodeDecode } from "@/components/tools/EncodeDecode";

type Tool = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  Icon: LucideIcon;
  Component: React.ComponentType<ToolProps>;
};

const TOOLS: Tool[] = [
  {
    id: "image-converter",
    name: "Image converter",
    tagline: "JPG, PNG and WebP — swap formats right in the browser.",
    accent: "#43B4FF",
    Icon: ImageIcon,
    Component: ImageConverter,
  },
  {
    id: "image-compressor",
    name: "Image compressor",
    tagline: "Resize by width and dial in quality. See before/after size.",
    accent: "#2EE6A0",
    Icon: Shrink,
    Component: ImageCompressor,
  },
  {
    id: "readme",
    name: "README generator",
    tagline: "Fill the form, watch the markdown build, copy or download.",
    accent: "#AD5CFF",
    Icon: FileText,
    Component: ReadmeGenerator,
  },
  {
    id: "aws-cost",
    name: "AWS cost estimator",
    tagline: "Ballpark a monthly bill for EC2, S3, Lambda and data out.",
    accent: "#FF9900",
    Icon: Calculator,
    Component: AwsCostEstimator,
  },
  {
    id: "json",
    name: "JSON formatter",
    tagline: "Pretty-print, minify and validate. Clear parse errors.",
    accent: "#FF57EA",
    Icon: Braces,
    Component: JsonFormatter,
  },
  {
    id: "encode",
    name: "Encode / decode",
    tagline: "Base64, URL encoding and a case converter in one panel.",
    accent: "#43B4FF",
    Icon: Wand2,
    Component: EncodeDecode,
  },
];

const COMING_SOON = ["PPT → PDF", "PDF → PPT", "DOCX → PDF", "PDF → DOCX"];

export function ToolkitHub() {
  const [activeId, setActiveId] = React.useState<string>(TOOLS[0]?.id ?? "");
  const active = TOOLS.find((t) => t.id === activeId) ?? TOOLS[0];

  if (!active) return null;
  const Active = active.Component;

  return (
    <div>
      {/* Tool switcher — wraps to any width, one active pill tinted per tool. */}
      <Reveal>
        <div
          role="tablist"
          aria-label="Choose a tool"
          className="flex flex-wrap gap-2"
        >
          {TOOLS.map((tool) => {
            const isActive = tool.id === active.id;
            const Icon = tool.Icon;
            return (
              <button
                key={tool.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveId(tool.id)}
                style={
                  isActive
                    ? {
                        borderColor: tool.accent,
                        color: tool.accent,
                        boxShadow: `0 0 22px -8px ${tool.accent}`,
                      }
                    : undefined
                }
                className={cn(
                  "focus-visible:ring-ring inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs tracking-wide transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none",
                  isActive
                    ? "bg-foreground/[0.04]"
                    : "border-border/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {tool.name}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Active tool card. key remounts on switch so per-tool state resets. */}
      <div
        className="ring-border/60 bg-card/40 mt-8 rounded-lg ring-1"
        style={{ "--accent": active.accent } as React.CSSProperties}
      >
        <div className="border-border/60 border-b px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2.5">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: active.accent,
                boxShadow: `0 0 12px ${active.accent}`,
              }}
            />
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {active.name}
            </h2>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{active.tagline}</p>
        </div>
        <div className="p-5 sm:p-7">
          <Active key={active.id} accent={active.accent} />
        </div>
      </div>

      {/* Honest note — the tools we deliberately did not fake. */}
      <Reveal>
        <div className="ring-border/60 border-l-orange/70 mt-8 rounded-lg border-l-2 px-5 py-4 ring-1 sm:px-7">
          <div className="flex items-center gap-2">
            <ServerCog className="text-orange size-4 shrink-0" />
            <h3 className="font-display text-base font-semibold tracking-tight">
              Coming soon — needs a server
            </h3>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
            Office ⇄ PDF conversion can&apos;t be done accurately in the browser
            — it needs a real converter (LibreOffice) running on a server.
            We&apos;d rather ship nothing than a button that mangles your file,
            so these are parked until we have a backend for them:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {COMING_SOON.map((item) => (
              <li
                key={item}
                className="border-border/70 text-muted-foreground rounded-full border px-3 py-1 font-mono text-xs"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
