import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { corsHeaders } from "./http";

export function optionsResponse() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export const SESSION_COOKIE = "session";

function sessionCookieFlags() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax${secure}`;
}

export function sessionCookieHeader(token: string) {
  return { "Set-Cookie": `${SESSION_COOKIE}=${token}; ${sessionCookieFlags()}` };
}

export function clearSessionCookieHeader() {
  return { "Set-Cookie": `${SESSION_COOKIE}=; ${sessionCookieFlags()}; Max-Age=0` };
}

export function getCookie(req: NextRequest, name: string) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(new RegExp(`${name}=([^;]+)`));
  return m?.[1] || null;
}
