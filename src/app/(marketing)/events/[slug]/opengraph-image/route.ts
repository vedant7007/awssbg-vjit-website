import { NextRequest } from "next/server";
import EventOgImage from "../opengraph-image";

export const runtime = "edge";

interface Params {
  slug: string;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Params> },
) {
  const params = await context.params;
  return EventOgImage({ params: Promise.resolve(params) });
}
