import type { Metadata, Viewport } from "next";
import { Josefin_Sans, Fraunces } from "next/font/google";
import "./globals.css";

// Avant Garde Gothic web equivalent — geometric, clean, art-deco
const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-avant-garde",
  weight: ["100", "200", "300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Cooper BT web equivalent — optical display serif with rounded warmth
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-cooper",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Artify — Discover Art",
  description: "Discover art you love. Swipe through masterpieces, like, save, and see them in 3D.",
};

export const viewport: Viewport = {
  themeColor: "#F1E2D1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={`${josefinSans.variable} ${fraunces.variable}`}>
        {/* ── Global animated background ── */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -10,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-10%",
              backgroundImage: "url('/images/BackgroundImage.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: 0,
              animation: "bgFadeIn 2.5s ease forwards, kenBurns 60s ease-in-out 2.5s infinite",
            }}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
