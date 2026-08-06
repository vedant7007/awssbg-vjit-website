"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import type { BoothPhoto } from "@/lib/firestore/booth";
import { deleteBoothPhotoAction } from "./actions";

export function BoothModeration({ photos }: { photos: BoothPhoto[] }) {
  const [items, setItems] = React.useState(photos);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => setItems(photos), [photos]);

  const remove = (photo: BoothPhoto) => {
    const prev = items;
    setItems((cur) => cur.filter((p) => p.id !== photo.id));
    startTransition(async () => {
      const res = await deleteBoothPhotoAction(photo.id);
      if (!res.ok) {
        setItems(prev);
        toast.error(res.error ?? "Couldn't delete.");
      } else {
        toast.success("Photo removed.");
      }
    });
  };

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        No booth photos yet. They appear here as students add them.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((photo) => (
        <div
          key={photo.id}
          className="group bg-muted relative aspect-square overflow-hidden rounded-lg border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt="Booth submission"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            aria-label="Delete photo"
            onClick={() => remove(photo)}
            className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 focus-visible:opacity-100"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
