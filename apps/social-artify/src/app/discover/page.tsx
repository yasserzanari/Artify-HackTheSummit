"use client";
import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFeedStore, useArtworks } from "@/store/feed";
import { useAuthStore, useAuth } from "@/store/auth";
import type { Artwork } from "@/types";

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import CategoryFilter from "@/components/artwork/CategoryFilter";
import SwipeDeck, { type SwipeDeckHandle } from "@/components/artwork/SwipeDeck";
import ActionBar from "@/components/artwork/ActionBar";
import GuestBanner from "@/components/auth/GuestBanner";
import AuthModal from "@/components/auth/AuthModal";
import type { ArtProfile } from "@/types";

const PROFILE_LABELS: Record<ArtProfile, { name: string; icon: string }> = {
  renaissance: { name: "Renaissance",  icon: "architecture" },
  moderne:     { name: "Moderne",       icon: "brush" },
  abstrait:    { name: "Abstrait",      icon: "auto_awesome" },
  surrealisme: { name: "Surréalisme",   icon: "psychology" },
};

export default function DiscoverPage() {
  const router = useRouter();
  const deckRef = useRef<SwipeDeckHandle>(null);

  const activeCategory = useFeedStore((s) => s.activeCategory);
  const likeArtwork = useFeedStore((s) => s.likeArtwork);
  const unlikeArtwork = useFeedStore((s) => s.unlikeArtwork);
  const user = useAuthStore((s) => s.user);
  const setPendingAction = useAuthStore((s) => s.setPendingAction);
  const setAuthModalOpen = useAuthStore((s) => s.setAuthModalOpen);

  // Si l'user a un profil → show all artworks; sinon → filtre par catégorie active
  const categoryForFilter = user?.artProfile ? undefined : activeCategory;
  const { artworks: filtered } = useArtworks(categoryForFilter);

  // Initialise auth depuis le cookie JWT
  useAuth();

  // Track top card so ActionBar stays in sync with the deck
  const [currentArtwork, setCurrentArtwork] = useState<Artwork | null>(null);
  const handleTopCardChange = useCallback((artwork: Artwork | null) => {
    setCurrentArtwork(artwork);
  }, []);

  // ── Like handler (shared by swipe and ActionBar) ─────────────────────────
  const handleLike = useCallback(
    async (artwork: Artwork) => {
      if (!user) {
        setPendingAction({ type: "like", artworkId: artwork.id });
        setAuthModalOpen(true);
        return;
      }
      likeArtwork(artwork.id, user.id);
      try {
        const res = await fetch(`/api/artworks/${artwork.id}?action=like`, { method: "POST", credentials: "include" });
        if (!res.ok) unlikeArtwork(artwork.id, user.id);
      } catch {
        unlikeArtwork(artwork.id, user.id);
      }
    },
    [user, likeArtwork, unlikeArtwork, setPendingAction, setAuthModalOpen]
  );

  const handlePass = useCallback((_artwork: Artwork) => {}, []);
  const handleCardTap = useCallback(
    (artwork: Artwork) => { router.push(`/artwork/${artwork.id}`); },
    [router]
  );

  const handleActionBarPass = () => { deckRef.current?.advance(); };
  const handleActionBarLike = () => {
    const artwork = deckRef.current?.topArtwork;
    if (!artwork) return;
    handleLike(artwork);
    if (user) deckRef.current?.advance();
  };

  const topForActionBar = currentArtwork ?? filtered[0] ?? null;

  return (
    <div className="flex flex-col h-dvh overflow-hidden lg:pl-50">
      <TopBar />

      {/* Filtre catégorie OU chip profil */}
      {user?.artProfile ? (
        <div className="flex items-center gap-2 px-4 py-2 shrink-0">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "#F3E1E8", color: "#810B38" }}
          >
            <span className="material-icons" style={{ fontSize: "13px", lineHeight: 1 }}>
              {PROFILE_LABELS[user.artProfile].icon}
            </span>
            {PROFILE_LABELS[user.artProfile].name}
          </div>
          <button
            onClick={() => router.push("/quiz")}
            className="text-[11px] font-semibold text-muted underline underline-offset-2 active:opacity-70"
          >
            Changer
          </button>
        </div>
      ) : (
        <CategoryFilter />
      )}

      <p className="text-center text-[11px] font-semibold tracking-widest text-muted/60 uppercase pt-1 pb-0.5 shrink-0 lg:hidden">
        Swipe to vote · Tap to view
      </p>

      <div className="flex-1 relative px-4 pt-2 pb-1 min-h-0 lg:flex lg:items-center lg:justify-center">
        <div className="relative w-full h-full lg:max-w-110 lg:h-full">
          <SwipeDeck
            ref={deckRef}
            artworks={filtered}
            onLike={handleLike}
            onPass={handlePass}
            onCardTap={handleCardTap}
            onTopCardChange={handleTopCardChange}
          />
        </div>
      </div>

      <ActionBar artwork={topForActionBar} onPass={handleActionBarPass} onLike={handleActionBarLike} />
      <GuestBanner />
      <div className="h-24 shrink-0 lg:hidden" />
      <BottomNav />
      <AuthModal />
    </div>
  );
}
