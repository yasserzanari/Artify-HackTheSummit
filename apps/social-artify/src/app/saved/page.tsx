"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import BottomNav from "@/components/layout/BottomNav";
import AuthModal from "@/components/auth/AuthModal";
import type { Artwork } from "@/types";

export default function SavedPage() {
  const router = useRouter();
  const { isLoggedIn, sessionChecked } = useAuth();
  const [saved, setSaved] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionChecked) return;
    if (!isLoggedIn) router.replace("/onboarding");
  }, [sessionChecked, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    fetch("/api/artworks", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setSaved((data.artworks ?? []).filter((a: Artwork) => a.isSavedByMe)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!sessionChecked || !isLoggedIn) return null;

  return (
    <div className="flex flex-col min-h-dvh bg-background lg:pl-50">

      <div className="flex items-center gap-3 px-5 pt-10 pb-5 lg:px-10 lg:pt-12">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-surface hover:bg-border transition-colors lg:hidden" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="text-text font-bold text-xl" style={{ fontFamily: "var(--font-serif)" }}>
            Saved
          </h1>
          {!loading && (
            <p className="text-xs text-muted mt-0.5">{saved.length} {saved.length === 1 ? "artwork" : "artworks"}</p>
          )}
        </div>
      </div>

      <div className="h-px bg-border mx-5 lg:mx-10 mb-5" />

      <div className="px-5 pb-32 lg:px-10 lg:pb-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : saved.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C2A07A" strokeWidth="1.5" className="mb-3">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            <p className="text-muted text-sm">No saved artworks yet.</p>
            <Link href="/discover" className="mt-3 text-sm font-semibold text-primary underline underline-offset-2">
              Discover artworks
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {saved.map((a) => (
              <Link key={a.id} href={`/artwork/${a.id}`} className="group block aspect-square rounded-xl overflow-hidden relative bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy" decoding="async"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2" style={{ fontFamily: "var(--font-serif)" }}>
                    {a.title}
                  </p>
                  <p className="text-white/60 text-[10px] mt-0.5">{a.artistName}</p>
                </div>
                {a.has3D && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: "#810B38" }}>
                    3D
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
      <AuthModal />
    </div>
  );
}
