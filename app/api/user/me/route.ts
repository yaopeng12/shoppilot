import { getCurrentUser } from "@/lib/tiktok-adgen/auth";
import { PLANS } from "@/lib/tiktok-adgen/types";
import { getUser } from "@/lib/tiktok-adgen/db";
import { json } from "@/lib/tiktok-adgen/http";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "Not authenticated" });

  const dbUser = await getUser(user.id);

  return json(200, {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    planInfo: PLANS[user.plan],
    apiKey: user.apiKey || null,
    usage: user.usage,
    createdAt: dbUser?.createdAt || new Date().toISOString(),
  });
}
