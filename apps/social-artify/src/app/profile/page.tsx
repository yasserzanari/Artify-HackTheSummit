"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import BottomNav from "@/components/layout/BottomNav";
import AuthModal from "@/components/auth/AuthModal";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, isGuest } = useAuth();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const artworks = useFeedStore((s) => s.artworks);

  // Si pas connecté et pas guest → onboarding
  useEffect(() => {
    if (!isLoggedIn && !isGuest) {
      router.push("/onboarding");
    }
  }, [isLoggedIn, isGuest, router]);

  const handleLogout = () => {
    logout();
    router.push("/onboarding");
  };

  const likedCount = user
    ? artworks.filter((a) => a.likedBy.includes(user.id)).length
    : 0;
  const savedCount = user
    ? artworks.filter((a) => a.savedBy.includes(user.id)).length
    : 0;

  const roleLabel =
    user?.role === "artist" ? "Artist" : user?.role === "viewer" ? "Art Lover" : "Guest";

  return (
    <div className="flex flex-col min-h-dvh lg:pl-50">
      {/* ── Header ── */}
      <header className="flex items-center justify-between h-14 px-5 bg-background border-b border-border shrink-0">
        <span
          className="text-xl font-bold text-text lg:hidden"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Artify<span className="text-primary">.</span>
        </span>
        <span className="hidden lg:block text-sm font-semibold uppercase tracking-widest text-muted">
          Profile
        </span>
        <div />
      </header>

      <div className="flex-1 px-5 pt-10 pb-32 max-w-lg mx-auto w-full">
        {isLoggedIn && user ? (
          <>
            {/* ── Avatar initiales + infos ── */}
            <div className="flex flex-col items-center text-center mb-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-white text-2xl font-bold select-none"
                style={{ backgroundColor: "#810B38" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h1
                className="text-2xl font-bold text-text mb-1"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {user.name}
              </h1>
              <p className="text-muted text-sm mb-3">{user.email}</p>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#F3E1E8", color: "#810B38" }}
              >
                <span className="material-icons" style={{ fontSize: "14px" }}>
                  {user.role === "artist" ? "draw" : "palette"}
                </span>
                {roleLabel}
              </span>
            </div>

            {/* ── Stats ── */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 bg-surface rounded-2xl px-4 py-5 text-center">
                <p
                  className="text-3xl font-bold text-text"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {likedCount}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">
                  Liked
                </p>
              </div>
              <div className="flex-1 bg-surface rounded-2xl px-4 py-5 text-center">
                <p
                  className="text-3xl font-bold text-text"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {savedCount}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">
                  Saved
                </p>
              </div>
            </div>

            {/* ── Member since ── */}
            <div className="bg-surface rounded-2xl px-5 py-4 mb-8">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
                Member since
              </p>
              <p className="text-sm text-text font-medium">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* ── Logout ── */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full border-2 border-border text-muted font-semibold text-sm hover:border-primary hover:text-primary transition-colors active:scale-95"
            >
              <span className="material-icons" style={{ fontSize: "18px" }}>
                logout
              </span>
              Log out
            </button>
          </>
        ) : (
          /* ── Guest : invitation à créer un compte ── */
          <div className="flex flex-col items-center text-center pt-12">
            <span
              className="material-icons mb-4"
              style={{ fontSize: "4.5rem", color: "var(--color-border)" }}
            >
              account_circle
            </span>
            <h1
              className="text-2xl font-bold text-text mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              You&apos;re browsing as a guest
            </h1>
            <p className="text-muted text-sm mb-8 leading-relaxed max-w-xs">
              Create an account to like and save artworks,
              and keep track of your collection.
            </p>
            <button
              onClick={() => openAuthModal("register")}
              className="flex items-center justify-center w-full py-4 bg-primary text-white rounded-full font-semibold text-base mb-3 active:scale-95 transition-transform"
            >
              Get started
            </button>
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center justify-center w-full py-3.5 rounded-full border border-border text-muted font-medium text-sm active:scale-95 transition-transform"
            >
              Already have an account? Sign in
            </button>
          </div>
        )}
      </div>

      <div className="h-24 shrink-0 lg:hidden" />
      <BottomNav />
      <AuthModal />
    </div>
  );
}
