import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/server/middleware/jwt";
import { getAll } from "@/server/services/artwork.service";

export async function GET(req: NextRequest) {
  const payload = await verifyToken(req);
  const category = req.nextUrl.searchParams.get("category");
  const artworks = getAll(payload?.userId, category);
  return NextResponse.json({ artworks });
}
