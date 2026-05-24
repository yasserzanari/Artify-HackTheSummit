"use client";
import { useRef, useEffect, useState } from "react";
import type { Artwork } from "@/types";

interface ArtworkCardProps {
  artwork: Artwork;
  compact?: boolean;
}

export default function ArtworkCard({ artwork, compact }: ArtworkCardProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Cached images never fire onLoad — check if already decoded on mount
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        borderRadius: "var(--radius-card, 12px)",
        backgroundColor: "#C9A882",
      }}
    >
      {artwork.imageUrl && !errored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={artwork.imageUrl}
          alt={artwork.title}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          decoding="async"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}

      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "#C9A882" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)" }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {artwork.location && (
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {artwork.location}
            </span>
          )}
          <span className="text-[10px] font-semibold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {artwork.year}
          </span>
          {artwork.has3D && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#810B38" }}>
              3D READY
            </span>
          )}
        </div>
        <h2 className={`text-white font-bold leading-tight ${compact ? "text-xl" : "text-[1.6rem]"}`} style={{ fontFamily: "var(--font-serif)" }}>
          {artwork.title}
        </h2>
        <p className="text-white/70 text-sm mt-1">
          {artwork.artistName}
          {!compact && artwork.medium && <span className="text-white/45"> · {artwork.medium}</span>}
        </p>
      </div>
    </div>
  );
}
