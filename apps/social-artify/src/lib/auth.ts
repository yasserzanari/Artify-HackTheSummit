import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-prod"
);

export interface TokenPayload {
  userId: string;
  role: string;
}

/** Crée un JWT signé valide 1 jours */
export async function signToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(SECRET);
}

/** Lit et vérifie le JWT dans le cookie "token". Retourne null si absent/invalide. */
export async function verifyToken(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/** Config cookie réutilisable */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 jours
  secure: process.env.NODE_ENV === "production",
} as const;
