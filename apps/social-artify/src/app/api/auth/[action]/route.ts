import { NextRequest, NextResponse } from "next/server";
import { register, login, me, updateUser } from "@/server/services/auth.service";
import { verifyToken, COOKIE_OPTIONS } from "@/server/middleware/jwt";
import { SOCIAL_AUTH_COOKIE } from "@/lib/auth";

type Params = { params: Promise<{ action: string }> };

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { action } = await params;
  if (action !== "me") return err("Not found", 404);
  try {
    const payload = await verifyToken(req);
    if (!payload) return err("Not logged in", 401);
    return NextResponse.json({ user: me(payload.userId) });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Not found", 404);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { action } = await params;

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SOCIAL_AUTH_COOKIE);
    return res;
  }

  try {
    const body = await req.json();

    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) return err("Missing fields", 400);
      const { user, token } = await login(email, password);
      const res = NextResponse.json({ user });
      res.cookies.set(SOCIAL_AUTH_COOKIE, token, COOKIE_OPTIONS);
      return res;
    }

    if (action === "register") {
      const { name, email, password, role } = body;
      if (!name || !email || !password) return err("Missing fields", 400);
      const { user, token } = await register(name, email, password, role);
      const res = NextResponse.json({ user }, { status: 201 });
      res.cookies.set(SOCIAL_AUTH_COOKIE, token, COOKIE_OPTIONS);
      return res;
    }

    return err("Not found", 404);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Error", 400);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { action } = await params;
  if (action !== "user") return err("Not found", 404);
  try {
    const payload = await verifyToken(req);
    if (!payload) return err("Not logged in", 401);
    const { name, email, password } = await req.json();
    const user = await updateUser(payload.userId, { name, email, password });
    return NextResponse.json({ user });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Update failed", 400);
  }
}
