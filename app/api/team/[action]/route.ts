import type { NextRequest } from "next/server";

import { loadDB, saveDB } from "@/lib/tiktok-adgen/db";
import { getUser } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { genId } from "@/lib/tiktok-adgen/security";
import { optionsResponse } from "@/lib/tiktok-adgen/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ action: string }> };

export const OPTIONS = optionsResponse;

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { action } = await ctx.params;
  const db = await loadDB();

  if (action === "info") {
    const user = getUser(db, req);
    if (!user || !user.teamId) return json(404, { error: "No team" });
    const team = db.teams[user.teamId];
    if (!team) return json(404, { error: "Team not found" });
    const members = team.members
      .map((id) => {
        const u = db.users[id];
        return u ? { id: u.id, name: u.name, email: u.email, plan: u.plan } : null;
      })
      .filter(Boolean);
    return json(200, { ...team, members, memberDetails: members });
  }

  return json(404, { error: "Not Found" });
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { action } = await ctx.params;
  const db = await loadDB();
  const user = getUser(db, req);

  if (action === "create") {
    if (!user) return json(401, { error: "Not authenticated" });
    if (user.plan !== "team") return json(403, { error: "Team plan required" });
    if (user.teamId) return json(409, { error: "Already in a team" });
    const { name } = (await req.json().catch(() => ({}))) as { name?: string };
    const teamId = genId();
    db.teams[teamId] = {
      id: teamId,
      name: name || `${user.name}'s Team`,
      members: [user.id],
      invites: [],
      createdAt: new Date().toISOString(),
    };
    user.teamId = teamId;
    await saveDB(db);
    return json(201, db.teams[teamId]);
  }

  if (action === "invite") {
    if (!user || !user.teamId) return json(403, { error: "No team" });
    const team = db.teams[user.teamId];
    if (!team) return json(404, { error: "Team not found" });
    const { email } = (await req.json().catch(() => ({}))) as { email?: string };
    if (team.members.length >= 10) return json(403, { error: "Team limit reached (10 members)" });
    const emailLower = String(email || "").toLowerCase();
    if (emailLower && !team.invites.includes(emailLower)) team.invites.push(emailLower);
    await saveDB(db);
    return json(200, { ok: true, message: `Invitation sent to ${emailLower}` });
  }

  if (action === "join") {
    if (!user) return json(401, { error: "Not authenticated" });
    if (user.teamId) return json(409, { error: "Already in a team" });
    const { teamId } = (await req.json().catch(() => ({}))) as { teamId?: string };
    const team = teamId ? db.teams[teamId] : undefined;
    if (!team) return json(404, { error: "Team not found" });
    if (!team.invites.includes(user.email)) return json(403, { error: "Not invited" });
    team.members.push(user.id);
    team.invites = team.invites.filter((e) => e !== user.email);
    user.teamId = teamId!;
    user.plan = "team";
    await saveDB(db);
    return json(200, { ok: true, team });
  }

  return json(404, { error: "Not Found" });
}
