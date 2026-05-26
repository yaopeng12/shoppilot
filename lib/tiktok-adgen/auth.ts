import { PLANS, type PlanId, type PublicUser, type UsageSnapshot } from "./types";
import { getOrCreateUser, getUsage, recordUsage, updateUser } from "./db";
import crypto from "crypto";

export async function getCurrentUser(): Promise<PublicUser | null> {
  const { auth: nextAuth } = await import("@/auth");
  const session = await nextAuth();
  if (!session?.user?.id) return null;

  const user = getOrCreateUser(
    session.user.id,
    session.user.email || "",
    session.user.name || "",
    session.user.image || undefined
  );

  if (!user.apiKey) {
    const updated = updateUser(user.id, { apiKey: generateApiKey() });
    user.apiKey = updated?.apiKey;
  }

  const plan = user.plan || "free";
  const usageData = getUsage(user.id);
  const planInfo = PLANS[plan] || PLANS.free;

  const usage: UsageSnapshot = {
    used: usageData.used,
    limit: planInfo.dailyLimit,
    remaining: planInfo.dailyLimit === -1 ? -1 : Math.max(0, planInfo.dailyLimit - usageData.used),
    plan,
  };

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan,
    apiKey: user.apiKey,
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
