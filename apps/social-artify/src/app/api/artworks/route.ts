import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import type { Artwork } from "@/lib/types";

function toClient(artwork: Artwork, userId?: string) {
  const { likedBy, savedBy, ...rest } = artwork;
  return {
    ...rest,
    isLikedByMe: userId ? likedBy.includes(userId) : false,
    isSavedByMe: userId ? savedBy.includes(userId) : false,
  };
}

/** GET /api/artworks?category=Baroque */
export async function GET(req: NextRequest) {
  const payload = await verifyToken(req);
  const userId = payload?.userId;
  const category = req.nextUrl.searchParams.get("category");

  let artworks = db.artworks.getAll();
  if (category && category !== "All")
    artworks = artworks.filter((a) => a.categories.includes(category));

  return NextResponse.json({ artworks: artworks.map((a) => toClient(a, userId)) });
}
