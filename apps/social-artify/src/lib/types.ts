export type Role = "guest" | "viewer" | "artist";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

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
  categories: string[]; // e.g. ['Baroque', 'Portraits']
  imageUrl: string;
  has3D: boolean;
  description?: string;
  likes: number;
  likedBy: string[]; // user IDs
  savedBy: string[]; // user IDs
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isGuest: boolean;
}
