import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Artify",
  description: "Discover art you love, swipe to explore.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
