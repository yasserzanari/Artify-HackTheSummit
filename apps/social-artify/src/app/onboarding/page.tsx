"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import AuthModal from "@/components/auth/AuthModal";

const BG_IMAGE = "/images/BackgroundImage.webp";

export default function OnboardingPage() {
  const router = useRouter();
  const { browseAsGuest, isLoggedIn } = useAuth();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  useEffect(() => {
    if (isLoggedIn) router.push("/discover");
  }, [isLoggedIn, router]);

  const handleGuest = () => {
    browseAsGuest();
    router.push("/discover");
  };

  return (
    <div className="relative flex h-dvh overflow-hidden">

      {/* ══════════════════════════════════
          COLONNE GAUCHE — contenu
          Mobile  : plein écran avec image + gradient
          Desktop : fond crème, ½ écran
      ══════════════════════════════════ */}
      <div className="relative flex flex-col w-full lg:w-1/2 bg-background">

        {/* Image de fond — mobile seulement (lg:hidden) */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `url(${BG_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        {/* Gradient sombre — mobile seulement */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%)",
          }}
        />

        {/* Contenu */}
        <div className="relative z-10 flex flex-col h-full px-8 pt-14 pb-10 lg:justify-center lg:px-14 lg:py-16"
          style={{ paddingBottom: "max(40px, calc(env(safe-area-inset-bottom, 0px) + 40px))" }}
        >
          {/* Logo */}
          <div className="lg:mb-12">
            <span
              className="text-xl font-bold text-white lg:text-text"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Artify<span className="text-primary">.</span>
            </span>
          </div>

          {/* Spacer — pousse le texte en bas sur mobile */}
          <div className="flex-1 lg:hidden" />

          {/* ── Copy ── */}
          <div>
            {/* Tag line */}
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-5 text-white/60 lg:text-muted">
              A NEW WAY TO SEE ART
            </p>

            {/* Headline — fonte Cooper BT / Fraunces */}
            <h1
              className="font-bold leading-[1.08] mb-5 text-white lg:text-text"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
                fontStyle: "italic",
                letterSpacing: "-0.01em",
              }}
            >
              Step closer<br />
              to the canvas.
            </h1>

            {/* Sub copy */}
            <p className="text-sm leading-relaxed mb-8 text-white/65 lg:text-muted">
              Scan any work in the museum to see it in 3D.
              <br />
              Discover new artists. Listen to every painting.
            </p>

            {/* ── CTA principale ── */}
            <button
              onClick={() => openAuthModal("register")}
              className="flex items-center justify-center w-full py-4 rounded-full font-semibold text-base mb-3 active:scale-95 transition-transform
                         bg-white text-text
                         lg:bg-primary lg:text-white lg:hover:bg-primary/90"
            >
              Get started
            </button>

            {/* ── Login link ── */}
            <p className="text-sm text-center mb-4 text-white/65 lg:text-muted">
              Already have an account?{" "}
              <button
                onClick={() => openAuthModal("login")}
                className="font-semibold underline underline-offset-2 text-white lg:text-primary"
              >
                Sign in
              </button>
            </p>

            {/* ── Bouton Guest — outlined, proper UX ── */}
            <button
              onClick={handleGuest}
              className="flex items-center justify-center w-full py-3.5 rounded-full text-sm font-medium border transition-all active:scale-95
                         border-white/40 text-white/70 hover:border-white/70 hover:text-white
                         lg:border-border lg:text-muted lg:hover:bg-surface lg:hover:text-text lg:hover:border-border"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-70">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Continue as guest
            </button>
          </div>

          {/* Font debug — petite ligne en bas qui confirme que la font custom charge */}
          <p className="mt-6 text-[10px] text-white/30 lg:text-muted/40 text-center select-none"
            style={{ fontFamily: "var(--font-avant-garde)" }}>
            Josefin Sans · Fraunces — custom fonts active
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════
          COLONNE DROITE — image desktop seulement
      ══════════════════════════════════ */}
      <div
        className="hidden lg:block lg:w-1/2 shrink-0"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      />

      <AuthModal />
    </div>
  );
}
