"use client";

import * as React from "react";
import { Html5Qrcode } from "html5-qrcode";

import { cn } from "@/lib/utils/cn";
import { logger } from "@/lib/utils/logger";

/*
 * Camera-based QR scanner built on html5-qrcode. Client-only. Starts the rear
 * camera, calls onScan with each decoded string, and debounces duplicate reads.
 * Consumers (admin/checkin) own verifying the code server-side.
 */
export function QRScanner({
  onScan,
  onError,
  className,
}: {
  onScan: (decoded: string) => void;
  onError?: (message: string) => void;
  className?: string;
}) {
  const regionId = React.useId().replace(/:/g, "");
  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const lastScanRef = React.useRef<{ value: string; at: number } | null>(null);
  const onScanRef = React.useRef(onScan);
  const onErrorRef = React.useRef(onError);
  onScanRef.current = onScan;
  onErrorRef.current = onError;

  React.useEffect(() => {
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;
    let active = true;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          const now = Date.now();
          const last = lastScanRef.current;
          // Ignore the same code within a 2s window to avoid double check-ins.
          if (last && last.value === decoded && now - last.at < 2000) return;
          lastScanRef.current = { value: decoded, at: now };
          onScanRef.current(decoded);
        },
        () => {
          // Per-frame decode misses are normal; do not surface them.
        },
      )
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : "Camera unavailable";
        logger.error("QR scanner failed to start", err);
        onErrorRef.current?.(message);
      });

    return () => {
      active = false;
      const s = scannerRef.current;
      if (s && s.isScanning) {
        s.stop()
          .then(() => s.clear())
          .catch(() => undefined);
      }
    };
  }, [regionId]);

  return (
    <div
      id={regionId}
      className={cn(
        "bg-ink/5 aspect-square w-full max-w-sm overflow-hidden rounded-sm border",
        className,
      )}
    />
  );
}
