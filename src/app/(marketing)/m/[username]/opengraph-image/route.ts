import { NextRequest } from "next/server";
import MemberOgImage from "../opengraph-image";

export const runtime = "edge";

interface Params {
  username: string;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Params> },
) {
  const params = await context.params;
  return MemberOgImage({ params: Promise.resolve(params) });
}
