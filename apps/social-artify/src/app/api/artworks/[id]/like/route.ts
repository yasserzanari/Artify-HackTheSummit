import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/** POST /api/artworks/[id]/like — toggle like (auth requis) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await verifyToken(req);
  if (!payload)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const artworks = db.artworks.getAll();
  const artwork = artworks.find((a) => a.id === id);
  if (!artwork)
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });

  const alreadyLiked = artwork.likedBy.includes(payload.userId);
  if (alreadyLiked) {
    artwork.likedBy = artwork.likedBy.filter((uid) => uid !== payload.userId);
    artwork.likes--;
  } else {
    artwork.likedBy.push(payload.userId);
    artwork.likes++;
  }

  db.artworks.save(artworks);
  return NextResponse.json({ likes: artwork.likes, liked: !alreadyLiked });
}
