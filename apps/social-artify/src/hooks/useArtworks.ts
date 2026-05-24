"use client";
/**
 * Returns artworks from the in-memory mock feed store.
 * When the real API is ready, replace the store read with a fetch call.
 */
import { useMemo } from "react";
import { useFeedStore } from "@/store/feedStore";
import { useAuthStore } from "@/store/authStore";
import type { Artwork, ArtProfile } from "@/lib/types";

const PROFILE_CATEGORIES: Record<ArtProfile, string> = {
  renaissance: "Renaissance",
  moderne:     "Moderne",
  abstrait:    "Abstrait",
  surrealisme: "Surréalisme",
};

export function useArtworks(category?: string): {
  artworks: Artwork[];
  isLoading: false; // always false — mock data is synchronous
} {
  const allArtworks = useFeedStore((s) => s.artworks);
  const user = useAuthStore((s) => s.user);

  const artworks = useMemo(() => {
    // Explicit category filter (not "All") — ignore profile
    if (category && category !== "All") {
      if (category === "New 3D") return allArtworks.filter((a) => a.has3D);
      return allArtworks.filter((a) =>
        a.categories.some((c) => c.toLowerCase().includes(category.toLowerCase()))
      );
    }

    // "All" with a profile → filter by profile categories
    if (user?.artProfile) {
      const profileCat = PROFILE_CATEGORIES[user.artProfile];
      return allArtworks.filter((a) =>
        a.categories.includes(profileCat)
      );
    }

    return allArtworks;
  }, [allArtworks, category, user]);

  return { artworks, isLoading: false };
}
