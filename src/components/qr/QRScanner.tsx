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
  scanning,
  onScan,
  onError,
  className,
}: {
  scanning: boolean;
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

  // Initialize the scanner instance once on mount
  React.useEffect(() => {
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;

    return () => {
      if (scanner.isScanning) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => undefined);
      } else {
        try {
          scanner.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [regionId]);

  // Start / stop camera based on the `scanning` prop
  React.useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    let active = true;

    if (scanning) {
      // Start the scanner if not already scanning
      if (!scanner.isScanning) {
        scanner
          .start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 240, height: 240 } },
            (decoded) => {
              const now = Date.now();
              const last = lastScanRef.current;
              if (last && last.value === decoded && now - last.at < 2000)
                return;
              lastScanRef.current = { value: decoded, at: now };
              onScanRef.current(decoded);
            },
            () => {
              // Per-frame decode misses are normal
            },
          )
          .catch((err: unknown) => {
            if (!active) return;
            const message =
              err instanceof Error ? err.message : "Camera unavailable";
            logger.error("QR scanner failed to start", err);
            onErrorRef.current?.(message);
          });
      }
    } else {
      // Stop the scanner if it's active
      if (scanner.isScanning) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => undefined);
      }
    }

    return () => {
      active = false;
    };
  }, [scanning]);

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
