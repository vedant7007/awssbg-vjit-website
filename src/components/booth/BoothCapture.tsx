"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Camera,
  Download,
  RefreshCw,
  Loader2,
  CircleAlert,
  SwitchCamera,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

type Phase = "loading" | "ready" | "uploading" | "done";
type Facing = "user" | "environment";

/** The camera photo-booth. The camera only runs while the dialog is open
 * (Inner mounts/unmounts with it, so the stream is always released). */
export function BoothCapture({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add yourself to the globe</DialogTitle>
          <DialogDescription>
            Snap a photo — it appears live on the homepage.
          </DialogDescription>
        </DialogHeader>
        {open ? <Inner onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function Inner({ onClose }: { onClose: () => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [captured, setCaptured] = React.useState<string | null>(null);
  const [camError, setCamError] = React.useState<string | null>(null);
  const [facing, setFacing] = React.useState<Facing>("user");
  const [flash, setFlash] = React.useState(0);

  // (Re)start the camera whenever the facing mode changes; always release the
  // previous stream first, and on unmount.
  React.useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setCamError(null);
    streamRef.current?.getTracks().forEach((t) => t.stop());

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setPhase("ready");
      } catch {
        setCamError(
          "Couldn't open the camera. Allow camera access in your browser and try again.",
        );
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const capture = React.useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    setFlash((n) => n + 1); // trigger the shutter flash

    const SIZE = 720;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const s = Math.min(vw, vh);
    // Mirror only the front camera so the shot matches the selfie preview.
    if (facing === "user") {
      ctx.translate(SIZE, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, SIZE, SIZE);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
    setCaptured(dataUrl);
    setPhase("uploading");

    try {
      const res = await fetch("/api/booth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Upload failed.");
      }
      setPhase("done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
      setPhase("ready");
    }
  }, [facing]);

  const download = React.useCallback(() => {
    if (!captured) return;
    const a = document.createElement("a");
    a.href = captured;
    a.download = "aws-sbg-vjit.jpg";
    a.click();
  }, [captured]);

  const retake = React.useCallback(() => {
    setCaptured(null);
    setPhase("ready");
  }, []);

  if (camError) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CircleAlert className="text-destructive size-8" />
        <p className="text-muted-foreground text-sm">{camError}</p>
      </div>
    );
  }

  const mirror = facing === "user" ? "[transform:scaleX(-1)]" : "";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-muted relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${mirror} ${captured ? "hidden" : ""}`}
        />
        {captured ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={captured}
            alt="Your photo"
            className="h-full w-full object-cover"
          />
        ) : null}

        {/* Shutter flash — re-keyed so it replays on every capture. */}
        {flash > 0 ? (
          <div
            key={flash}
            className="booth-shutter pointer-events-none absolute inset-0 bg-white"
            aria-hidden
          />
        ) : null}

        {phase === "loading" ? (
          <div className="text-muted-foreground absolute inset-0 grid place-items-center">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : null}
        {phase === "uploading" ? (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
            <span className="inline-flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Adding…
            </span>
          </div>
        ) : null}

        {/* Flip camera (front/back) — mostly useful on phones. */}
        {phase !== "done" && !captured ? (
          <button
            type="button"
            onClick={() =>
              setFacing((f) => (f === "user" ? "environment" : "user"))
            }
            aria-label="Switch camera"
            className="absolute right-2 bottom-2 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
          >
            <SwitchCamera className="size-4" />
          </button>
        ) : null}
      </div>

      {phase === "done" ? (
        <div className="w-full space-y-3 text-center">
          <p className="text-success text-sm font-medium">
            Added to the globe! 🎉
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={download} className="rounded-full">
              <Download className="size-4" />
              Download
            </Button>
            <Button onClick={retake} variant="outline" className="rounded-full">
              <RefreshCw className="size-4" />
              Take another
            </Button>
            <Button onClick={onClose} variant="ghost" className="rounded-full">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={capture}
          disabled={phase !== "ready"}
          size="lg"
          className="glow-pill rounded-full px-8"
        >
          <Camera className="size-5" />
          {phase === "uploading" ? "Adding…" : "Take photo"}
        </Button>
      )}
    </div>
  );
}
