"use client";
/**
 * Returns a single artwork by ID from the in-memory mock feed store.
 * When the real API is ready, replace the store read with a fetch call.
 */
import { useFeedStore } from "@/store/feedStore";
import type { Artwork } from "@/lib/types";

export function useArtwork(id: string): {
  artwork: Artwork | null;
  isLoading: false; // always false — mock data is synchronous
} {
  const artwork = useFeedStore((s) => s.artworks.find((a) => a.id === id) ?? null);
  return { artwork, isLoading: false };
}
