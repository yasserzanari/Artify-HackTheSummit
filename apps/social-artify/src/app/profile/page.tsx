"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useAuthStore } from "@/store/auth";
import BottomNav from "@/components/layout/BottomNav";
import AuthModal from "@/components/auth/AuthModal";
import type { Artwork } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, sessionChecked, logout } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionChecked) return;
    if (!isLoggedIn) router.replace("/onboarding");
  }, [sessionChecked, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    fetch("/api/artworks", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const all: Artwork[] = data.artworks ?? [];
        setLikedArtworks(all.filter((a) => a.isLikedByMe));
        setSavedCount(all.filter((a) => a.isSavedByMe).length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const openEdit = () => {
    setName(user!.name);
    setEmail(user!.email);
    setPassword("");
    setError("");
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          password: password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!sessionChecked || !isLoggedIn) return null;

  const initials = user!.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-text text-sm outline-none focus:border-primary transition-colors";

  return (
    <div className="flex flex-col min-h-dvh bg-background lg:pl-50">

      <div className="px-5 pt-10 pb-6 lg:px-10 lg:pt-12">

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ backgroundColor: "#810B38", fontFamily: "var(--font-serif)" }}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-text font-bold text-xl leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
              {user!.name}
            </h1>
            <span
              className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: user!.role === "artist" ? "#F3E1E8" : "#DCC3AA",
                color: user!.role === "artist" ? "#810B38" : "#6B4A36",
              }}
            >
              {user!.role === "artist" ? "Artist" : "Art Lover"}
            </span>
          </div>
        </div>

        <div className="flex gap-8 mb-6">
          <div>
            <p className="text-xl font-bold text-text">{likedArtworks.length}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-medium">Liked</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-xl font-bold text-text">{savedCount}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-medium">Saved</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/saved" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-center border border-border bg-surface hover:bg-border transition-colors">
            Saved artworks
          </Link>
          <button onClick={openEdit} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-border bg-surface hover:bg-border transition-colors text-muted">
            Edit
          </button>
          <button onClick={logout} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-border bg-surface hover:bg-border transition-colors text-muted">
            Log out
          </button>
        </div>
      </div>

      {editing && (
        <div className="mx-5 mb-5 p-5 rounded-2xl border border-border bg-surface lg:mx-10">
          <p className="text-sm font-bold text-text mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Edit profile
          </p>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <input type="text" placeholder="Name" value={name}
              onChange={(e) => setName(e.target.value)} className={inputCls} />
            <input type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            <input type="password" placeholder="New password (optional)" value={password}
              onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            {error && <p className="text-primary text-xs">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-full bg-text text-surface text-sm font-semibold disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-full border border-border text-sm font-semibold text-muted">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="h-px bg-border mx-5 lg:mx-10 mb-5" />

      <div className="px-5 pb-32 lg:px-10 lg:pb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Liked artworks</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : likedArtworks.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C2A07A" strokeWidth="1.5" className="mb-3">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="text-muted text-sm">No liked artworks yet.</p>
            <Link href="/discover" className="mt-3 text-sm font-semibold text-primary underline underline-offset-2">
              Start discovering
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {likedArtworks.map((a) => (
              <Link key={a.id} href={`/artwork/${a.id}`} className="group block aspect-square rounded-xl overflow-hidden relative bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.imageUrl} alt={a.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy" decoding="async" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2" style={{ fontFamily: "var(--font-serif)" }}>{a.title}</p>
                  <p className="text-white/60 text-[10px] mt-0.5">{a.artistName}</p>
                </div>
                {a.has3D && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: "#810B38" }}>3D</div>
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
