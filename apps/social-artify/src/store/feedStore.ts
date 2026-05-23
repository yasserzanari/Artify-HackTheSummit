"use client";
import { create } from "zustand";
import type { Artwork } from "@/lib/types";
import { SEED_ARTWORKS } from "@/lib/mockData";

interface FeedStore {
  artworks: Artwork[];
  activeCategory: string;
  likeArtwork: (artworkId: string, userId: string) => void;
  unlikeArtwork: (artworkId: string, userId: string) => void;
  saveArtwork: (artworkId: string, userId: string) => void;
  unsaveArtwork: (artworkId: string, userId: string) => void;
  prependArtwork: (artwork: Artwork) => void;
  setCategory: (category: string) => void;
}

export const useFeedStore = create<FeedStore>()((set) => ({
  artworks: SEED_ARTWORKS,
  activeCategory: "All",
  likeArtwork: (artworkId, userId) =>
    set((state) => ({
      artworks: state.artworks.map((a) =>
        a.id === artworkId
          ? {
              ...a,
              likes: a.likes + 1,
              likedBy: [...a.likedBy, userId],
            }
          : a
      ),
    })),
  unlikeArtwork: (artworkId, userId) =>
    set((state) => ({
      artworks: state.artworks.map((a) =>
        a.id === artworkId
          ? {
              ...a,
              likes: Math.max(0, a.likes - 1),
              likedBy: a.likedBy.filter((id) => id !== userId),
            }
          : a
      ),
    })),
  saveArtwork: (artworkId, userId) =>
    set((state) => ({
      artworks: state.artworks.map((a) =>
        a.id === artworkId
          ? { ...a, savedBy: [...a.savedBy, userId] }
          : a
      ),
    })),
  unsaveArtwork: (artworkId, userId) =>
    set((state) => ({
      artworks: state.artworks.map((a) =>
        a.id === artworkId
          ? { ...a, savedBy: a.savedBy.filter((id) => id !== userId) }
          : a
      ),
    })),
  prependArtwork: (artwork) =>
    set((state) => ({ artworks: [artwork, ...state.artworks] })),
  setCategory: (category) => set({ activeCategory: category }),
}));
