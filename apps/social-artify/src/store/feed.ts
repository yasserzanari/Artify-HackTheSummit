"use client";
import { create } from "zustand";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import type { Artwork } from "@/types";

interface FeedStore {
  artworks: Artwork[];
  activeCategory: string;
  setArtworks: (artworks: Artwork[]) => void;
  setCategory: (category: string) => void;
  upsertArtwork: (artwork: Artwork) => void;
  likeArtwork: (artworkId: string, userId: string) => void;
  unlikeArtwork: (artworkId: string, userId: string) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  artworks: [],
  activeCategory: "All",

  setArtworks: (artworks) => set({ artworks }),
  setCategory: (activeCategory) => set({ activeCategory }),

  upsertArtwork: (artwork) =>
    set((s) => ({
      artworks: s.artworks.some((a) => a.id === artwork.id)
        ? s.artworks.map((a) => (a.id === artwork.id ? artwork : a))
        : [...s.artworks, artwork],
    })),

  likeArtwork: (artworkId, userId) =>
    set((s) => ({
      artworks: s.artworks.map((a) => {
        if (a.id !== artworkId) return a;
        const likedBy = a.likedBy ?? [];
        if (likedBy.includes(userId)) return a;
        return { ...a, likes: a.likes + 1, likedBy: [...likedBy, userId], isLikedByMe: true };
      }),
    })),

  unlikeArtwork: (artworkId, userId) =>
    set((s) => ({
      artworks: s.artworks.map((a) => {
        if (a.id !== artworkId) return a;
        const likedBy = a.likedBy ?? [];
        if (!likedBy.includes(userId)) return a;
        return { ...a, likes: Math.max(0, a.likes - 1), likedBy: likedBy.filter((id) => id !== userId), isLikedByMe: false };
      }),
    })),
}));

export function useArtworks(category?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { artworks, setArtworks } = useFeedStore();

  useEffect(() => {
    setIsLoading(true);
    const q = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    fetch(`/api/artworks${q}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setArtworks(data.artworks ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  return { artworks, isLoading };
}

export function useLike(artworkId: string) {
  const user = useAuthStore((s) => s.user);
  const setPendingAction = useAuthStore((s) => s.setPendingAction);
  const setAuthModalOpen = useAuthStore((s) => s.setAuthModalOpen);
  const artworks = useFeedStore((s) => s.artworks);
  const likeArtwork = useFeedStore((s) => s.likeArtwork);
  const unlikeArtwork = useFeedStore((s) => s.unlikeArtwork);

  const artwork = artworks.find((a) => a.id === artworkId);
  const isLiked = user ? (artwork?.isLikedByMe ?? (artwork?.likedBy ?? []).includes(user.id)) : false;
  const likes = artwork?.likes ?? 0;

  const toggle = async () => {
    if (!user) {
      setPendingAction({ type: "like", artworkId });
      setAuthModalOpen(true);
      return;
    }
    // Optimistic update — apply immediately, revert if the server responds with an error
    isLiked ? unlikeArtwork(artworkId, user.id) : likeArtwork(artworkId, user.id);
    try {
      const res = await fetch(`/api/artworks/${artworkId}?action=like`, { method: "POST", credentials: "include" });
      if (!res.ok) isLiked ? likeArtwork(artworkId, user.id) : unlikeArtwork(artworkId, user.id);
    } catch {
      isLiked ? likeArtwork(artworkId, user.id) : unlikeArtwork(artworkId, user.id);
    }
  };

  return { isLiked, toggle, likes };
}
