import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const COOKIE_NAME = "artify_social_token";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production");
}
const SECRET = new TextEncoder().encode(jwtSecret ?? "dev-secret-change-in-prod");

export interface TokenPayload {
  userId: string;
  role: string;
}

export async function signToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export const COOKIE_OPTIONS = {
  httpOnly: true, // JS can't read this cookie — protects against XSS token theft
  path: "/social",
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
} as const;
