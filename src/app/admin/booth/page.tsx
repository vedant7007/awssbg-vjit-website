import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { listBoothPhotos } from "@/lib/firestore/booth";
import { PageShell } from "@/components/layout/PageShell";
import { BoothModeration } from "./BoothModeration";

export const metadata: Metadata = { title: "Booth | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminBoothPage() {
  const photos = await safe(listBoothPhotos(), [], "admin:booth");

  return (
    <PageShell
      eyebrow="Orientation"
      title="Photo booth"
      description={`${photos.length} ${
        photos.length === 1 ? "photo" : "photos"
      } on the live globe. Hover a photo to remove it.`}
    >
      <BoothModeration photos={photos} />
    </PageShell>
  );
}
