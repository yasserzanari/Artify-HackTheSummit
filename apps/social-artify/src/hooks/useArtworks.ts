"use client";
/**
 * Returns artworks from the in-memory mock feed store.
 * When the real API is ready, replace the store read with a fetch call.
 */
import { useMemo } from "react";
import { useFeedStore } from "@/store/feedStore";
import type { Artwork } from "@/lib/types";

export function useArtworks(category?: string): {
  artworks: Artwork[];
  isLoading: false; // always false — mock data is synchronous
} {
  const allArtworks = useFeedStore((s) => s.artworks);

  const artworks = useMemo(() => {
    if (!category || category === "All") return allArtworks;
    if (category === "New 3D") return allArtworks.filter((a) => a.has3D);
    return allArtworks.filter((a) =>
      a.categories.some((c) => c.toLowerCase().includes(category.toLowerCase()))
    );
  }, [allArtworks, category]);

  return { artworks, isLoading: false };
}
