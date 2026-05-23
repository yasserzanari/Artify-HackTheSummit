// Zustand store for the discover feed — artworks, likes, saves, active category
// TODO: implement with zustand + persist middleware
import type { Artwork } from "@/lib/types";

export interface FeedStore {
  artworks: Artwork[];
  swipedIds: string[]; // already liked or skipped this session
  activeCategory: string; // "All" | "Baroque" | "Renaissance" | ...
  likeArtwork: (artworkId: string, userId: string) => void;
  saveArtwork: (artworkId: string, userId: string) => void;
  skipArtwork: (artworkId: string) => void;
  prependArtwork: (artwork: Artwork) => void;
  setCategory: (category: string) => void;
}
