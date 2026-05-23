"use client";

import { useState, useEffect } from "react";
import { useFeedStore } from "@/store/feedStore";
import type { Artwork } from "@/lib/types";

export function useArtworks(category?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { artworks, setArtworks } = useFeedStore();

  useEffect(() => {
    setIsLoading(true);
    const params = category && category !== "All"
      ? `?category=${encodeURIComponent(category)}`
      : "";
    fetch(`/api/artworks${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { artworks: Artwork[] }) => setArtworks(data.artworks ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [category, setArtworks]);

  return { artworks, isLoading };
}
