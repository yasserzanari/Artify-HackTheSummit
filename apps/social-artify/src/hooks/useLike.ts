"use client";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";

export function useLike(artworkId: string) {
  const user = useAuthStore((s) => s.user);
  const setPendingAction = useAuthStore((s) => s.setPendingAction);
  const setAuthModalOpen = useAuthStore((s) => s.setAuthModalOpen);

  const artworks = useFeedStore((s) => s.artworks);
  const likeArtwork = useFeedStore((s) => s.likeArtwork);
  const unlikeArtwork = useFeedStore((s) => s.unlikeArtwork);

  const artwork = artworks.find((a) => a.id === artworkId);
  const isLiked = user ? (artwork?.likedBy ?? []).includes(user.id) : false;
  const likes = artwork?.likes ?? 0;

  const toggle = () => {
    if (!user) {
      setPendingAction({ type: "like", artworkId });
      setAuthModalOpen(true);
      return;
    }
    if (isLiked) {
      unlikeArtwork(artworkId, user.id);
    } else {
      likeArtwork(artworkId, user.id);
    }
  };

  return { isLiked, toggle, likes };
}
