"use client";

import * as React from "react";
import { Download, ImageIcon, Upload } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  downloadBlob,
  Field,
  formatBytes,
  NativeSelect,
  type ToolProps,
} from "@/components/tools/shared";

type Format = "png" | "jpeg" | "webp";

const FORMAT_MIME: Record<Format, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

type Loaded = {
  img: HTMLImageElement;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
};

type Output = { url: string; size: number; format: Format };

/** Base filename without its extension, so we can re-suffix it. */
function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function ImageConverter({ accent }: ToolProps) {
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [format, setFormat] = React.useState<Format>("png");
  const [output, setOutput] = React.useState<Output | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);

  // Revoke the last blob URL whenever it is replaced or the tool unmounts.
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
          type: file.type,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
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

  async function convert() {
    if (!loaded) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = loaded.width;
      canvas.height = loaded.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser.");
      // JPEG has no alpha — paint white first so transparency doesn't go black.
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(loaded.img, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, FORMAT_MIME[format], 0.92),
      );
      if (!blob) throw new Error("This browser could not encode that format.");
      if (output) URL.revokeObjectURL(output.url);
      setOutput({ url: URL.createObjectURL(blob), size: blob.size, format });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  const outName = loaded
    ? `${stem(loaded.name)}.${format === "jpeg" ? "jpg" : format}`
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
        <Upload
          className="text-muted-foreground size-6"
          style={{ color: accent }}
        />
        <span className="text-sm">
          <span className="text-foreground font-medium">Drop an image</span>{" "}
          <span className="text-muted-foreground">or click to choose</span>
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          JPG · PNG · WebP — nothing leaves your browser
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
          <div className="space-y-3">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">
              Source
            </p>
            <div className="ring-border/60 bg-muted/30 grid place-items-center overflow-hidden rounded-md ring-1">
              {/* Object URL from a user file; next/image can't optimise it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={loaded.img.src}
                alt={loaded.name}
                className="max-h-56 w-auto object-contain"
              />
            </div>
            <dl className="text-muted-foreground grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
              <dt>File</dt>
              <dd className="text-foreground truncate">{loaded.name}</dd>
              <dt>Type</dt>
              <dd className="text-foreground">{loaded.type || "unknown"}</dd>
              <dt>Size</dt>
              <dd className="text-foreground">{formatBytes(loaded.size)}</dd>
              <dt>Dimensions</dt>
              <dd className="text-foreground">
                {loaded.width}×{loaded.height}
              </dd>
            </dl>
          </div>

          <div className="space-y-4">
            <Field label="Convert to" htmlFor="conv-format">
              <NativeSelect
                id="conv-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as Format)}
              >
                <option value="png">PNG (lossless, transparency)</option>
                <option value="jpeg">JPG (smaller, no transparency)</option>
                <option value="webp">WebP (modern, small)</option>
              </NativeSelect>
            </Field>

            <Button
              type="button"
              onClick={convert}
              disabled={busy}
              className="w-full"
              style={{ backgroundColor: accent, color: "#0b0f17" }}
            >
              <ImageIcon />
              {busy ? "Converting…" : "Convert"}
            </Button>

            {output ? (
              <div className="ring-border/60 space-y-3 rounded-md p-4 ring-1">
                <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">
                  Result — {output.format.toUpperCase()}
                </p>
                <div className="grid place-items-center overflow-hidden rounded">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={output.url}
                    alt="Converted result"
                    className="max-h-40 w-auto object-contain"
                  />
                </div>
                <p className="font-mono text-xs">
                  <span className="text-muted-foreground">New size: </span>
                  <span className="text-foreground">
                    {formatBytes(output.size)}
                  </span>
                </p>
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
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
