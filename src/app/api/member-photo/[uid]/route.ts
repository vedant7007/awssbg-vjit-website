import { getMemberPhoto } from "@/lib/firestore/memberPhotos";

export const runtime = "nodejs";

/* Serves an uploaded profile photo as a real image response. Public, because
 * profile photos already appear on the public team pages. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uid: string }> },
): Promise<Response> {
  const { uid } = await params;
  const dataUrl = await getMemberPhoto(uid);
  if (!dataUrl) return new Response("Not found", { status: 404 });

  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!match?.[1] || !match[2])
    return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "Content-Type": match[1],
      // Replaced photos get a new ?v= stamp, so this can cache freely.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
