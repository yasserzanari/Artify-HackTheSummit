export type Role = "guest" | "viewer" | "artist";

export type ArtProfile = "renaissance" | "moderne" | "abstrait" | "surrealisme";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  artProfile?: ArtProfile;
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
  categories: string[];
  imageUrl: string;
  has3D: boolean;
  arWebId?: string;
  description?: string;
  likes: number;
  likedBy?: string[];
  savedBy?: string[];
  isLikedByMe?: boolean;
  isSavedByMe?: boolean;
  createdAt: string;
}
