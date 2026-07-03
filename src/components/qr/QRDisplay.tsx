"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";

import { cn } from "@/lib/utils/cn";

/**
 * Render a QR code for any string value (a URL, a signed ticket code, etc).
 * SVG output stays crisp at any size and prints cleanly on ID cards.
 */
export function QRDisplay({
  value,
  size = 180,
  caption,
  className,
}: {
  value: string;
  size?: number;
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn("inline-flex flex-col items-center gap-2", className)}
    >
      <div className="rounded-sm border bg-white p-3">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          marginSize={0}
          title="QR code"
          fgColor="#161d27"
          bgColor="#ffffff"
        />
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground max-w-[200px] text-center text-xs">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
