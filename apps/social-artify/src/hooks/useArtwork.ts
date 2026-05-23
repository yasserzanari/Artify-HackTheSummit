"use client";

import { useState, useEffect } from "react";
import type { Artwork } from "@/lib/types";

export function useArtwork(id: string) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/artworks/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { artwork: Artwork }) => setArtwork(data.artwork ?? null))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  return { artwork, isLoading };
}
