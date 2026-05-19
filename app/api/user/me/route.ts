import { auth, currentUser } from "@clerk/nextjs/server";
import { PLANS, type PlanId, type UsageSnapshot } from "@/lib/tiktok-adgen/types";
import { getUsage } from "@/lib/tiktok-adgen/db";
import { json } from "@/lib/tiktok-adgen/http";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "Not authenticated" });

  const user = await currentUser();
  if (!user) return json(401, { error: "Not authenticated" });

  const plan = (user.publicMetadata?.plan as PlanId) || "free";
  const planInfo = PLANS[plan];
  const apiKey = user.privateMetadata?.apiKey || null;
  const usageData = getUsage(userId);

  const usage: UsageSnapshot = {
    used: usageData.used,
    limit: planInfo.dailyLimit,
    remaining: planInfo.dailyLimit === -1 ? -1 : Math.max(0, planInfo.dailyLimit - usageData.used),
    plan,
  };

  return json(200, {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    name: user.firstName || user.username || "",
    plan,
    planInfo,
    apiKey,
    usage,
    createdAt: user.createdAt,
  });
}
