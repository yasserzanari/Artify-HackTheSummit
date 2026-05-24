import { db } from "@/server/db";
import type { Artwork } from "@/types";

// Strips internal arrays (likedBy/savedBy) and exposes boolean flags instead
function toClient(artwork: Artwork, userId?: string) {
  const { likedBy, savedBy, ...rest } = artwork;
  return {
    ...rest,
    isLikedByMe: userId ? likedBy.includes(userId) : false,
    isSavedByMe: userId ? savedBy.includes(userId) : false,
  };
}

export function getAll(userId?: string, category?: string | null) {
  let artworks = db.artworks.getAll();
  if (category && category !== "All")
    artworks = artworks.filter((a) => a.categories.includes(category));
  return artworks.map((a) => toClient(a, userId));
}

export function getById(id: string, userId?: string) {
  const artwork = db.artworks.getAll().find((a) => a.id === id);
  if (!artwork) return null;
  return toClient(artwork, userId);
}

export function toggleLike(id: string, userId: string) {
  const artworks = db.artworks.getAll();
  const artwork = artworks.find((a) => a.id === id);
  if (!artwork) return null;

  const liked = artwork.likedBy.includes(userId);
  if (liked) {
    artwork.likedBy = artwork.likedBy.filter((uid) => uid !== userId);
    artwork.likes = Math.max(0, artwork.likes - 1);
  } else {
    artwork.likedBy.push(userId);
    artwork.likes++;
  }

  db.artworks.save(artworks);
  return { liked: !liked, likes: artwork.likes };
}

export function toggleSave(id: string, userId: string) {
  const artworks = db.artworks.getAll();
  const artwork = artworks.find((a) => a.id === id);
  if (!artwork) return null;

  const saved = artwork.savedBy.includes(userId);
  if (saved) artwork.savedBy = artwork.savedBy.filter((uid) => uid !== userId);
  else artwork.savedBy.push(userId);

  db.artworks.save(artworks);
  return { saved: !saved };
}
