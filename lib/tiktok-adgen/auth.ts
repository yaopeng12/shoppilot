import { auth, currentUser } from "@clerk/nextjs/server";
import { PLANS, type PlanId, type PublicUser, type UsageSnapshot } from "./types";
import { getUsage, recordUsage } from "./db";
import crypto from "crypto";

export async function getCurrentUser(): Promise<PublicUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const plan = (user.publicMetadata?.plan as PlanId) || "free";
  const apiKey = (user.privateMetadata?.apiKey as string) || undefined;
  const usageData = getUsage(userId);
  const planInfo = PLANS[plan] || PLANS.free;

  const usage: UsageSnapshot = {
    used: usageData.used,
    limit: planInfo.dailyLimit,
    remaining: planInfo.dailyLimit === -1 ? -1 : Math.max(0, planInfo.dailyLimit - usageData.used),
    plan,
  };

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    name: user.firstName || user.username || "",
    plan,
    apiKey,
    usage,
  };
}

export function checkUsage(userId: string, plan: PlanId = "free"): { allowed: boolean; snapshot: UsageSnapshot } {
  const usageData = getUsage(userId);
  const planInfo = PLANS[plan] || PLANS.free;
  const limit = planInfo.dailyLimit;

  if (limit < 0) {
    return { allowed: true, snapshot: { used: usageData.used, limit, remaining: -1, plan } };
  }

  const remaining = Math.max(0, limit - usageData.used);
  return {
    allowed: usageData.used < limit,
    snapshot: { used: usageData.used, limit, remaining, plan },
  };
}

export function recordGeneration(userId: string) {
  recordUsage(userId);
}

export function generateApiKey(): string {
  return "tk_" + crypto.randomBytes(24).toString("hex");
}
