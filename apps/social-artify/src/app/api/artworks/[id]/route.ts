import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/server/middleware/auth";
import { getById, toggleLike, toggleSave } from "@/server/services/artwork.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await verifyToken(req);
  const artwork = getById(id, payload?.userId);

  if (!artwork)
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });

  return NextResponse.json({ artwork });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await verifyToken(req);
  if (!payload)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const action = req.nextUrl.searchParams.get("action");

  if (action === "like") {
    const result = toggleLike(id, payload.userId);
    if (!result)
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    return NextResponse.json(result);
  }

  if (action === "save") {
    const result = toggleSave(id, payload.userId);
    if (!result)
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
