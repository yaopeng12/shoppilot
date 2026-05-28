import { getCurrentUser } from "@/lib/tiktok-adgen/auth";
import { updateUser } from "@/lib/tiktok-adgen/db";
import { json } from "@/lib/tiktok-adgen/http";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "Not authenticated" });

  const { plan } = (await req.json().catch(() => ({}))) as { plan?: string };
  if (!plan || !(plan in PLANS) || plan === "free") return json(400, { error: "Invalid plan" });

  await updateUser(user.id, { plan: plan as PlanId });

  return json(200, {
    ok: true,
    plan,
    message: `Upgraded to ${PLANS[plan as PlanId].name}! (Demo mode - no payment processed)`,
  });
}
