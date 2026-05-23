"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import AuthModal from "@/components/auth/AuthModal";

const MONA_LISA_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg";

export default function OnboardingPage() {
  const router = useRouter();
  const { browseAsGuest, isLoggedIn } = useAuth();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  // Redirect to discover once authenticated
  useEffect(() => {
    if (isLoggedIn) router.push("/discover");
  }, [isLoggedIn, router]);

  const handleGuest = () => {
    browseAsGuest();
    router.push("/discover");
  };

  return (
    <div
      className="relative flex flex-col h-dvh overflow-hidden"
      style={{
        backgroundImage: `url(${MONA_LISA_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Gradient overlay — dark at bottom, clear at top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="px-7 pt-14">
          <span
            className="text-white text-xl font-bold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Artify<span style={{ color: "#810B38" }}>.</span>
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Hero copy */}
        <div
          className="px-7 pb-10"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}
        >
          {/* Tag line */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            A NEW WAY TO SEE ART
          </p>

          {/* Headline */}
          <h1
            className="text-white font-bold leading-tight mb-4"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 8vw, 3.25rem)",
              fontStyle: "italic",
            }}
          >
            Step closer
            <br />
            to the canvas.
          </h1>

          {/* Sub copy */}
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Scan any work in the museum to see it in 3D.
            <br />
            Discover new artists. Listen to every painting.
          </p>

          {/* Get started CTA */}
          <button
            onClick={() => openAuthModal("register")}
            className="flex items-center justify-center w-full py-4 bg-white text-text font-semibold rounded-full text-base mb-4 active:scale-95 transition-transform"
          >
            Get started
          </button>

          {/* Secondary actions */}
          <div className="flex flex-col items-center gap-3">
            <p
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Already have an account?{" "}
              <button
                onClick={() => openAuthModal("login")}
                className="text-white font-semibold underline underline-offset-2"
              >
                Sign in
              </button>
            </p>

            <button
              onClick={handleGuest}
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Browse without signing in
            </button>
          </div>
        </div>
      </div>

      {/* Auth modal rendered here so it works on this page too */}
      <AuthModal />
    </div>
  );
}
