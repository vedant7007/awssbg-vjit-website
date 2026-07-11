import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/server";
import {
  castVote,
  listRoadmapVotesByUser,
  removeVote,
} from "@/lib/firestore/roadmap";

export const runtime = "nodejs";

const bodySchema = z.object({ itemId: z.string().min(1) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ votedItemIds: [] });

  const votedItemIds = await listRoadmapVotesByUser(user.uid);
  return NextResponse.json({ votedItemIds });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    await castVote(parsed.data.itemId, user.uid);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message ?? "Failed" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    await removeVote(parsed.data.itemId, user.uid);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message ?? "Failed" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({});
}

export const dynamic = "force-dynamic";
