"use client";

import * as React from "react";
import { toast } from "sonner";
import { Camera, Loader2, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

const SIZE = 256; // square avatar; keeps the stored image tiny

/** Centre-crop to a square and compress, so a 4MB phone photo becomes ~20KB
 * before it ever leaves the browser. */
function toSquareJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't an image."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Couldn't process that image."));
        const s = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - s) / 2,
          (img.height - s) / 2,
          s,
          s,
          0,
          0,
          SIZE,
          SIZE,
        );
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Profile photo picker. Uploading stores the image right away and hands back a
 * URL; the surrounding form still has to be saved for it to stick to the
 * member's profile.
 */
export function PhotoField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file.");
      return;
    }
    setBusy(true);
    try {
      const image = await toSquareJpeg(file);
      const res = await fetch("/api/member-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed.");
      }
      onChange(data.url);
      toast.success("Photo uploaded — save to apply it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="bg-muted text-muted-foreground grid size-20 shrink-0 place-items-center overflow-hidden rounded-full">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Your profile photo"
            className="size-full object-cover"
          />
        ) : (
          <UserRound className="size-8" />
        )}
      </span>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
            {busy ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive rounded-full"
              disabled={busy}
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-muted-foreground text-xs">
          A square crop of any photo. Save your profile to apply it.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
        }}
      />
    </div>
  );
}
