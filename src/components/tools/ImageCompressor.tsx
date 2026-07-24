"use client";

import * as React from "react";
import { Download, Shrink, Upload } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  AccentRange,
  downloadBlob,
  Field,
  formatBytes,
  NativeSelect,
  type ToolProps,
} from "@/components/tools/shared";

type OutFormat = "jpeg" | "webp";

const OUT_MIME: Record<OutFormat, string> = {
  jpeg: "image/jpeg",
  webp: "image/webp",
};

type Loaded = {
  img: HTMLImageElement;
  name: string;
  size: number;
  width: number;
  height: number;
};

type Output = { url: string; size: number; width: number; height: number };

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function ImageCompressor({ accent }: ToolProps) {
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [maxWidth, setMaxWidth] = React.useState(1280);
  const [quality, setQuality] = React.useState(0.7);
  const [format, setFormat] = React.useState<OutFormat>("jpeg");
  const [output, setOutput] = React.useState<Output | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(
    () => () => {
      if (output) URL.revokeObjectURL(output.url);
    },
    [output],
  );

  const loadFile = React.useCallback((file: File) => {
    setError(null);
    setOutput(null);
    if (!file.type.startsWith("image/")) {
      setError("That is not an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      if (typeof src !== "string") return;
      const img = new Image();
      img.onload = () => {
        setLoaded({
          img,
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setMaxWidth((w) => Math.min(w, img.naturalWidth) || img.naturalWidth);
      };
      img.onerror = () => setError("Could not decode that image.");
      img.src = src;
    };
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsDataURL(file);
  }, []);

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files.item(0);
    if (file) loadFile(file);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.item(0);
    if (file) loadFile(file);
    e.target.value = "";
  }

  async function compress() {
    if (!loaded) return;
    setBusy(true);
    setError(null);
    try {
      const scale = maxWidth < loaded.width ? maxWidth / loaded.width : 1;
      const w = Math.max(1, Math.round(loaded.width * scale));
      const h = Math.max(1, Math.round(loaded.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser.");
      ctx.imageSmoothingQuality = "high";
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(loaded.img, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, OUT_MIME[format], quality),
      );
      if (!blob) throw new Error("This browser could not encode that format.");
      if (output) URL.revokeObjectURL(output.url);
      setOutput({
        url: URL.createObjectURL(blob),
        size: blob.size,
        width: w,
        height: h,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed.");
    } finally {
      setBusy(false);
    }
  }

  const saved =
    loaded && output ? Math.round((1 - output.size / loaded.size) * 100) : null;
  const outName = loaded
    ? `${stem(loaded.name)}-compressed.${format === "jpeg" ? "jpg" : format}`
    : "";

  return (
    <div className="space-y-6">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "focus-within:ring-ring flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-10 text-center transition-colors focus-within:ring-2",
          dragging
            ? "bg-foreground/[0.03]"
            : "border-border/70 hover:border-foreground/40",
        )}
        style={dragging ? { borderColor: accent } : undefined}
      >
        <Upload className="size-6" style={{ color: accent }} />
        <span className="text-sm">
          <span className="text-foreground font-medium">Drop an image</span>{" "}
          <span className="text-muted-foreground">or click to choose</span>
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          Resize by width and dial in quality — all in-browser
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={onPick}
          className="sr-only"
        />
      </label>

      {error ? (
        <p className="text-danger font-mono text-xs" role="alert">
          {error}
        </p>
      ) : null}

      {loaded ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Field
              label={`Max width — ${maxWidth}px`}
              htmlFor="cmp-width"
              hint={`Original is ${loaded.width}px wide. Larger than that keeps full size.`}
            >
              <AccentRange
                id="cmp-width"
                accent={accent}
                min={64}
                max={Math.max(loaded.width, 320)}
                step={16}
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
              />
            </Field>

            <Field
              label={`Quality — ${Math.round(quality * 100)}%`}
              htmlFor="cmp-quality"
              hint="Applies to JPG and WebP encoding."
            >
              <AccentRange
                id="cmp-quality"
                accent={accent}
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
            </Field>

            <Field label="Output format" htmlFor="cmp-format">
              <NativeSelect
                id="cmp-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as OutFormat)}
              >
                <option value="jpeg">JPG</option>
                <option value="webp">WebP (usually smaller)</option>
              </NativeSelect>
            </Field>

            <Button
              type="button"
              onClick={compress}
              disabled={busy}
              className="w-full"
              style={{ backgroundColor: accent, color: "#0b0f17" }}
            >
              <Shrink />
              {busy ? "Working…" : "Compress"}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="ring-border/60 bg-muted/30 grid place-items-center overflow-hidden rounded-md ring-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={output ? output.url : loaded.img.src}
                alt={output ? "Compressed preview" : loaded.name}
                className="max-h-56 w-auto object-contain"
              />
            </div>

            <div className="ring-border/60 grid grid-cols-2 divide-x rounded-md font-mono text-xs ring-1">
              <div className="p-3">
                <p className="text-muted-foreground tracking-[0.12em] uppercase">
                  Before
                </p>
                <p className="text-foreground mt-1 text-sm">
                  {formatBytes(loaded.size)}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  {loaded.width}×{loaded.height}
                </p>
              </div>
              <div className="p-3">
                <p className="text-muted-foreground tracking-[0.12em] uppercase">
                  After
                </p>
                <p className="text-foreground mt-1 text-sm">
                  {output ? formatBytes(output.size) : "—"}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  {output ? `${output.width}×${output.height}` : "—"}
                </p>
              </div>
            </div>

            {output ? (
              <>
                {saved !== null ? (
                  <p className="font-mono text-xs" style={{ color: accent }}>
                    {saved >= 0
                      ? `${saved}% smaller`
                      : `${Math.abs(saved)}% larger — try lower quality`}
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    const blob = await fetch(output.url).then((r) => r.blob());
                    downloadBlob(blob, outName);
                  }}
                >
                  <Download />
                  Download {outName}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
