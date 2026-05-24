import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ArtQuiz from "@/components/quiz/ArtQuiz";

// Body — neutral, modern, ultra-readable
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-var",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Display / headings — editorial serif with elegant contrast
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif-var",
  weight: ["400", "500", "600", "700", "800", "900"],
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
      <body className={`${inter.variable} ${playfairDisplay.variable}`}>
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
        <ArtQuiz />
      </body>
    </html>
  );
}
