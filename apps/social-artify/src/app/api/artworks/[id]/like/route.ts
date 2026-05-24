import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/server/middleware/auth";
import { toggleLike } from "@/server/services/artwork.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await verifyToken(req);
  if (!payload)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const result = toggleLike(id, payload.userId);

  if (!result)
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });

  return NextResponse.json(result);
}
