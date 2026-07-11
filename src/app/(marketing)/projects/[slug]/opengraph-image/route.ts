import { NextRequest } from "next/server";
import ProjectOgImage from "../opengraph-image";

export const runtime = "edge";

interface Params {
  slug: string;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Params> },
) {
  const params = await context.params;
  return ProjectOgImage({ params: Promise.resolve(params) });
}
