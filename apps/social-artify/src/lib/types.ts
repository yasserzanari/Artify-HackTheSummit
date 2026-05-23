// ─── Domain roles ────────────────────────────────────────────────────────────

export type Role = "guest" | "viewer" | "artist";

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

// ─── Artwork (internal — includes likedBy / savedBy arrays) ──────────────────

export interface Artwork {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  medium: string;
  year: number;
  dimensions?: string;
  museum?: string;
  location?: string;
  categories: string[];
  imageUrl: string;
  has3D: boolean;
  /** Matches the artwork ID used in ar-web (e.g. "mona-lisa"). Only set when has3D is true. */
  arWebId?: string;
  description?: string;
  likes: number;
  /** Internal — user IDs. Never sent to the client. */
  likedBy: string[];
  /** Internal — user IDs. Never sent to the client. */
  savedBy: string[];
  createdAt: string;
}

/**
 * ClientArtwork — safe to send to the browser.
 * Strips likedBy/savedBy and adds per-request booleans.
 */
export type ClientArtwork = Omit<Artwork, "likedBy" | "savedBy"> & {
  isLikedByMe: boolean;
  isSavedByMe: boolean;
};

// ─── Auth state (used by authStore on the client) ────────────────────────────

export interface AuthState {
  user: User | null;
  isGuest: boolean;
}

// ─── Shared error class used by services ─────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}
