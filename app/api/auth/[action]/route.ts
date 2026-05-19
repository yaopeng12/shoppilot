import type { NextRequest } from "next/server";

import { loadDB, saveDB } from "@/lib/tiktok-adgen/db";
import { getUser, usageSnapshot } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { PLANS } from "@/lib/tiktok-adgen/types";
import { genId, genKey, hashPw, verifyPw } from "@/lib/tiktok-adgen/security";
import { clearSessionCookieHeader, getCookie, optionsResponse, SESSION_COOKIE, sessionCookieHeader } from "@/lib/tiktok-adgen/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ action: string }> };

export const OPTIONS = optionsResponse;

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { action } = await ctx.params;
  const db = await loadDB();

  if (action === "me") {
    const user = getUser(db, req);
    if (!user) return json(401, { error: "Not authenticated" });
    const plan = PLANS[user.plan];
    return json(200, {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      planInfo: plan,
      apiKey: user.apiKey,
      teamId: user.teamId,
      usage: usageSnapshot(user),
    });
  }

  return json(404, { error: "Not Found" });
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { action } = await ctx.params;
  const db = await loadDB();

  if (action === "register") {
    const { email, password, name } = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      name?: string;
    };
    if (!email || !password) return json(400, { error: "Email and password required" });
    const emailLower = String(email).toLowerCase().trim();
    if (Object.values(db.users).find((u) => u.email === emailLower)) return json(409, { error: "Email already registered" });

    const id = genId();
    const user = {
      id,
      email: emailLower,
      name: name || emailLower.split("@")[0],
      password: await hashPw(String(password)),
      plan: "free" as const,
      apiKey: genKey(),
      usage: {},
      createdAt: new Date().toISOString(),
      teamId: null,
    };
    db.users[id] = user;
    const sessionToken = genId();
    db.sessions[sessionToken] = id;
    await saveDB(db);

    return json(
      201,
      { user: { id, email: user.email, name: user.name, plan: user.plan, apiKey: user.apiKey } },
      sessionCookieHeader(sessionToken)
    );
  }

  if (action === "login") {
    const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
    const emailLower = String(email || "").toLowerCase().trim();
    const user = Object.values(db.users).find((u) => u.email === emailLower);
    if (!user) return json(401, { error: "Invalid credentials" });
    const ok = await verifyPw(String(password || ""), user.password);
    if (!ok) return json(401, { error: "Invalid credentials" });

    const sessionToken = genId();
    db.sessions[sessionToken] = user.id;
    await saveDB(db);
    return json(
      200,
      { user: { id: user.id, email: user.email, name: user.name, plan: user.plan, apiKey: user.apiKey, teamId: user.teamId } },
      sessionCookieHeader(sessionToken)
    );
  }

  if (action === "logout") {
    const token = getCookie(req, SESSION_COOKIE);
    if (token) {
      delete db.sessions[token];
      await saveDB(db);
    }
    return json(200, { ok: true }, clearSessionCookieHeader());
  }

  return json(404, { error: "Not Found" });
}
