"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuth } from "@/store/auth";
import { useFeedStore } from "@/store/feed";
import { buildArExperienceUrl } from "@/lib/ar";
import BottomNav from "@/components/layout/BottomNav";
import AuthModal from "@/components/auth/AuthModal";
import type { Artwork } from "@/types";

export default function ArtworkDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [notFound, setNotFound] = useState(false);

  const user = useAuthStore((s) => s.user);
  const setPendingAction = useAuthStore((s) => s.setPendingAction);
  const setAuthModalOpen = useAuthStore((s) => s.setAuthModalOpen);
  const upsertArtwork = useFeedStore((s) => s.upsertArtwork);

  useAuth();

  useEffect(() => {
    fetch(`/api/artworks/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.artwork) return setNotFound(true);
        const a: Artwork = data.artwork;
        setArtwork(a);
        setIsSaved(a.isSavedByMe ?? false);
        setIsLiked(a.isLikedByMe ?? false);
        setLikes(a.likes ?? 0);
        upsertArtwork(a);
      })
      .catch(() => setNotFound(true));
  }, [id, upsertArtwork]);

  const handleLike = async () => {
    if (!user) { setPendingAction({ type: "like", artworkId: id }); setAuthModalOpen(true); return; }
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikes((n) => wasLiked ? Math.max(0, n - 1) : n + 1);
    try {
      const res = await fetch(`/api/artworks/${id}?action=like`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setIsLiked(data.liked);
        setLikes(data.likes);
        data.liked ? useFeedStore.getState().likeArtwork(id, user.id) : useFeedStore.getState().unlikeArtwork(id, user.id);
      } else {
        setIsLiked(wasLiked);
        setLikes((n) => wasLiked ? n + 1 : Math.max(0, n - 1));
      }
    } catch {
      setIsLiked(wasLiked);
      setLikes((n) => wasLiked ? n + 1 : Math.max(0, n - 1));
    }
  };

  const handleSave = async () => {
    if (!user) { setPendingAction({ type: "save", artworkId: id }); setAuthModalOpen(true); return; }
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    try {
      const res = await fetch(`/api/artworks/${id}?action=save`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) setIsSaved(data.saved); else setIsSaved(wasSaved);
    } catch {
      setIsSaved(wasSaved);
    }
  };

  if (notFound) return <div className="flex items-center justify-center h-dvh"><p className="text-muted">Artwork not found.</p></div>;
  if (!artwork) return <div className="flex items-center justify-center h-dvh"><div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  const categoryLabel = artwork.categories.join(" · ").toUpperCase();

  const BackBtn = ({ mobile }: { mobile?: boolean }) => (
    <button onClick={() => router.back()} aria-label="Go back"
      className={mobile ? "lg:hidden absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center" : "flex items-center gap-2 text-muted text-sm font-medium hover:text-text transition-colors"}
      style={mobile ? { background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" } : undefined}>
      <svg width={mobile ? 18 : 16} height={mobile ? 18 : 16} viewBox="0 0 24 24" fill="none" stroke={mobile ? "white" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {!mobile && "Back"}
    </button>
  );

  const SaveBtn = ({ mobile }: { mobile?: boolean }) => (
    <button onClick={handleSave} aria-label={isSaved ? "Remove bookmark" : "Save artwork"}
      className={mobile ? "w-9 h-9 rounded-full flex items-center justify-center" : "w-9 h-9 rounded-full flex items-center justify-center border border-border bg-surface hover:bg-border transition-colors"}
      style={mobile ? { background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" } : undefined}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill={isSaved ? (mobile ? "white" : "currentColor") : "none"} stroke={mobile ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mobile ? "" : "text-text"}>
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    </button>
  );

  const ShareBtn = ({ mobile }: { mobile?: boolean }) => (
    <button onClick={() => navigator.share?.({ title: artwork.title, url: window.location.href })} aria-label="Share"
      className={mobile ? "w-9 h-9 rounded-full flex items-center justify-center" : "w-9 h-9 rounded-full flex items-center justify-center border border-border bg-surface hover:bg-border transition-colors"}
      style={mobile ? { background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" } : undefined}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={mobile ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mobile ? "" : "text-text"}>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>
  );

  return (
    <div className="flex flex-col min-h-dvh bg-background lg:pl-50 lg:h-dvh lg:overflow-hidden">

      <div className="hidden lg:flex items-center justify-between px-8 h-14 shrink-0 border-b border-border bg-background">
        <BackBtn />
        <div className="flex gap-2"><SaveBtn /><ShareBtn /></div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 lg:flex-row lg:overflow-hidden">

        <div className="relative shrink-0 h-[55dvh] lg:h-full lg:w-1/2 bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork.imageUrl} alt={artwork.title} className="absolute inset-0 w-full h-full object-cover" decoding="async" fetchPriority="high" />
          <div className="absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)" }} />
          <BackBtn mobile />
          <div className="lg:hidden absolute top-4 right-4 flex gap-2"><SaveBtn mobile /><ShareBtn mobile /></div>
        </div>

        <div className="flex-1 px-5 pt-5 pb-32 lg:w-1/2 lg:overflow-y-auto lg:pb-10 lg:pt-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#810B38", fontFamily: "var(--font-serif)" }}>
            {artwork.year} · {categoryLabel}
          </p>
          <h1 className="text-text font-bold leading-tight mb-1" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
            {artwork.title}
          </h1>
          <p className="text-muted text-sm mb-4">
            <span className="font-medium text-text">{artwork.artistName}</span>
            {artwork.museum && <span> · {artwork.museum}{artwork.location ? `, ${artwork.location}` : ""}</span>}
          </p>

          {artwork.has3D && artwork.arWebId && (
            <button onClick={() => window.open(buildArExperienceUrl(artwork.arWebId!), "_blank", "noopener,noreferrer")}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-text text-surface rounded-full font-semibold text-sm mb-5 active:scale-95 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              View in 3D
            </button>
          )}

          <div className="h-px bg-border mb-4" />

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-0.5">Medium</p>
              <p className="text-sm text-text">{artwork.medium}</p>
            </div>
            {artwork.dimensions && (
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-0.5">Dimensions</p>
                <p className="text-sm text-text">{artwork.dimensions}</p>
              </div>
            )}
          </div>

          <div className="mb-5">
            <button onClick={handleLike} className="flex items-center gap-2 select-none active:scale-95 transition-transform" aria-label={isLiked ? "Unlike" : "Like"}>
              <svg width="26" height="26" viewBox="0 0 24 24"
                fill={isLiked ? "#810B38" : "none"} stroke={isLiked ? "#810B38" : "#6B4A36"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "fill 0.2s, stroke 0.2s" }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="text-sm font-medium text-muted">{likes.toLocaleString()}</span>
            </button>
          </div>

          {artwork.description && (
            <>
              <div className="h-px bg-border mb-4" />
              <p className="text-sm text-muted leading-relaxed">{artwork.description}</p>
            </>
          )}
        </div>
      </div>

      <BottomNav />
      <AuthModal />
    </div>
  );
}
