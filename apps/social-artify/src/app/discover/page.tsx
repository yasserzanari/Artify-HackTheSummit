"use client";
import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFeedStore } from "@/store/feedStore";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useArtworks } from "@/hooks/useArtworks";
import type { Artwork } from "@/lib/types";

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import CategoryFilter from "@/components/artwork/CategoryFilter";
import SwipeDeck, { type SwipeDeckHandle } from "@/components/artwork/SwipeDeck";
import ActionBar from "@/components/social/ActionBar";
import GuestBanner from "@/components/auth/GuestBanner";
import AuthModal from "@/components/auth/AuthModal";
import type { ArtProfile } from "@/lib/types";

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
  const user = useAuthStore((s) => s.user);
  const setShowQuiz = useAuthStore((s) => s.setShowQuiz);
  const setPendingAction = useAuthStore((s) => s.setPendingAction);
  const setAuthModalOpen = useAuthStore((s) => s.setAuthModalOpen);

  // Si l'user a un profil → filtrage par profil (ignore activeCategory)
  // Sinon → filtrage par catégorie active
  const categoryForFilter = user?.artProfile ? undefined : activeCategory;
  const { artworks: filtered } = useArtworks(categoryForFilter);

  // Track top card so ActionBar stays in sync with the deck
  const [currentArtwork, setCurrentArtwork] = useState<Artwork | null>(null);
  const handleTopCardChange = useCallback((artwork: Artwork | null) => {
    setCurrentArtwork(artwork);
  }, []);

  // Initialise auth from localStorage
  useAuth();

  // ── Like handler (shared by swipe and ActionBar) ─────────────────────────
  const handleLike = useCallback(
    (artwork: Artwork) => {
      if (!user) {
        setPendingAction({ type: "like", artworkId: artwork.id });
        setAuthModalOpen(true);
        return;
      }
      likeArtwork(artwork.id, user.id);
    },
    [user, likeArtwork, setPendingAction, setAuthModalOpen]
  );

  const handlePass = useCallback((_artwork: Artwork) => {
    // pass needs no store update in the feed view
  }, []);

  const handleCardTap = useCallback(
    (artwork: Artwork) => {
      router.push(`/artwork/${artwork.id}`);
    },
    [router]
  );

  // ── ActionBar button handlers ────────────────────────────────────────────
  const handleActionBarPass = () => {
    deckRef.current?.advance(); // advance deck only — no pass callback
  };

  const handleActionBarLike = () => {
    const artwork = deckRef.current?.topArtwork;
    if (!artwork) return;
    handleLike(artwork); // update store (auth-guarded)
    if (user) deckRef.current?.advance(); // advance deck if logged in
    // if not logged in, AuthModal opens — deck stays put until user logs in
  };

  // Fallback for ActionBar before deck ref is ready
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
            onClick={() => setShowQuiz(true)}
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

      {/* Card deck — centré et contrainte à 440px sur desktop */}
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

      <ActionBar
        artwork={topForActionBar}
        onPass={handleActionBarPass}
        onLike={handleActionBarLike}
      />

      <GuestBanner />

      {/* Spacer pour le pill nav mobile — caché sur desktop (sidebar remplace) */}
      <div className="h-24 shrink-0 lg:hidden" />
      <BottomNav />
      <AuthModal />
    </div>
  );
}
