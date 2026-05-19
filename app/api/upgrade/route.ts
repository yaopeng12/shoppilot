import type { NextRequest } from "next/server";

import { loadDB, saveDB } from "@/lib/tiktok-adgen/db";
import { getUser } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";
import { optionsResponse } from "@/lib/tiktok-adgen/session";

export const runtime = "nodejs";

export const OPTIONS = optionsResponse;

export async function POST(req: NextRequest) {
  const db = await loadDB();
  const user = getUser(db, req);
  if (!user) return json(401, { error: "Not authenticated" });

  const { plan } = (await req.json().catch(() => ({}))) as { plan?: string };
  if (!plan || !(plan in PLANS) || plan === "free") return json(400, { error: "Invalid plan" });

  user.plan = plan as PlanId;
  await saveDB(db);
  return json(200, {
    ok: true,
    plan,
    message: `Upgraded to ${PLANS[plan as PlanId].name}! (Demo mode — no payment processed)`,
  });
}
