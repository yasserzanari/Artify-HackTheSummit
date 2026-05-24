"use client";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { PanInfo } from "framer-motion";
import type { Artwork } from "@/types";
import ArtworkCard from "./ArtworkCard";

export interface SwipeDeckHandle {
  /** Advance the deck by one card without firing any like/pass callback. */
  advance: () => void;
  topArtwork: Artwork | null;
}

interface SwipeDeckProps {
  artworks: Artwork[];
  onLike: (artwork: Artwork) => void;
  onPass: (artwork: Artwork) => void;
  onCardTap: (artwork: Artwork) => void;
  /** Called whenever the top card changes (including swipes and resets). */
  onTopCardChange?: (artwork: Artwork | null) => void;
  onDeckComplete?: () => void;
}

interface DraggableCardProps {
  artwork: Artwork;
  onLike: () => void;
  onPass: () => void;
  onCardTap: () => void;
}

function DraggableCard({ artwork, onLike, onPass, onCardTap }: DraggableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -20], [1, 0]);
  const isDragging = useRef(false);

  const handleDragStart = () => { isDragging.current = true; };

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    // Swipe commits if the card moved > 80px or was flicked fast enough (> 400px/s)
    const hit =
      Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400;
    if (hit) {
      const dir = info.offset.x > 0 ? 1 : -1;
      await animate(x, dir * 720, { duration: 0.26, ease: "easeOut" });
      if (dir > 0) onLike();
      else onPass();
    } else {
      animate(x, 0, { type: "spring", damping: 22, stiffness: 320 });
    }
    // Delay prevents the tap handler from firing right after a drag ends
    setTimeout(() => { isDragging.current = false; }, 50);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      style={{ x, rotate, width: "100%", height: "100%" }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTap={() => { if (!isDragging.current) onCardTap(); }}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="relative w-full h-full">
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute inset-0 z-10 flex items-start justify-end p-5 pointer-events-none"
        >
          <span
            className="text-base font-bold text-green-400 border-2 border-green-400 px-3 py-1 rounded-md"
            style={{ transform: "rotate(-14deg)", textShadow: "0 1px 4px rgba(0,0,0,.5)" }}
          >
            <span className="flex items-center gap-1">
              LIKE
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </span>
          </span>
        </motion.div>
        <motion.div
          style={{ opacity: passOpacity }}
          className="absolute inset-0 z-10 flex items-start justify-start p-5 pointer-events-none"
        >
          <span
            className="text-base font-bold text-red-400 border-2 border-red-400 px-3 py-1 rounded-md"
            style={{ transform: "rotate(14deg)", textShadow: "0 1px 4px rgba(0,0,0,.5)" }}
          >
            PASS ✕
          </span>
        </motion.div>
        <ArtworkCard artwork={artwork} />
      </div>
    </motion.div>
  );
}

const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(
  function SwipeDeck({ artworks, onLike, onPass, onCardTap, onTopCardChange, onDeckComplete }, ref) {
    const [topIndex, setTopIndex] = useState(0);

    // Reset when artwork list changes (e.g. category filter)
    const artworkKey = useMemo(() => artworks.map((a) => a.id).join(","), [artworks]);
    const prevKeyRef = useRef(artworkKey);
    useEffect(() => {
      if (artworkKey !== prevKeyRef.current) {
        prevKeyRef.current = artworkKey;
        queueMicrotask(() => setTopIndex(0));
      }
    }, [artworkKey]);

    // Notify parent whenever the top card changes
    useEffect(() => {
      onTopCardChange?.(artworks[topIndex] ?? null);
    }, [topIndex, artworks, onTopCardChange]);

    useEffect(() => {
      if (artworks.length > 0 && topIndex >= artworks.length) {
        onDeckComplete?.();
      }
    }, [artworks.length, onDeckComplete, topIndex]);

    // Expose an advance() that just moves the deck forward (no callbacks)
    useImperativeHandle(ref, () => ({
      advance: () => setTopIndex((i) => i + 1),
      topArtwork: artworks[topIndex] ?? null,
    }), [artworks, topIndex]);

    const swipeLike = (artwork: Artwork) => {
      onLike(artwork);
      setTopIndex((i) => i + 1);
    };

    const swipePass = (artwork: Artwork) => {
      onPass(artwork);
      setTopIndex((i) => i + 1);
    };

    if (artworks.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-muted text-sm">No artworks in this category</p>
        </div>
      );
    }

    if (topIndex >= artworks.length) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-4 text-center px-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="font-bold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
            You&apos;ve seen it all
          </p>
          <p className="text-muted text-sm">
            You&apos;ve browsed every work in this collection.
          </p>
          <button
            onClick={() => setTopIndex(0)}
            className="mt-1 px-6 py-2.5 bg-primary text-white rounded-pill text-sm font-semibold"
          >
            See again
          </button>
        </div>
      );
    }

    const visible = artworks.slice(topIndex, topIndex + 3);

    return (
      <div className="relative w-full h-full">
        {[...visible].reverse().map((artwork, revIdx) => {
          const stackIdx = visible.length - 1 - revIdx; // 0 = top card
          const isTop = stackIdx === 0;
          const scale = 1 - stackIdx * 0.04;
          const ty = stackIdx * 12;

          return (
            <div
              key={artwork.id}
              className="absolute inset-0"
              style={{
                zIndex: visible.length - stackIdx,
                transform: `scale(${scale}) translateY(${ty}px)`,
                transformOrigin: "bottom center",
                transition: "transform 0.25s ease",
                pointerEvents: isTop ? "auto" : "none",
              }}
            >
              {isTop ? (
                <DraggableCard
                  artwork={artwork}
                  onLike={() => swipeLike(artwork)}
                  onPass={() => swipePass(artwork)}
                  onCardTap={() => onCardTap(artwork)}
                />
              ) : (
                <ArtworkCard artwork={artwork} />
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

export default SwipeDeck;
