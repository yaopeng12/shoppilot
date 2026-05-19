import type { NextRequest } from "next/server";
import type { DB, DBUser, PlanId, UsageSnapshot } from "./types";
import { PLANS } from "./types";
import { getCookie, SESSION_COOKIE } from "./session";

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getUser(db: DB, req: NextRequest): DBUser | null {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) {
    const user = Object.values(db.users).find((u) => u.apiKey === apiKey);
    if (user) return user;
  }

  const token = getCookie(req, SESSION_COOKIE);
  if (token && db.sessions[token]) return db.users[db.sessions[token]] || null;
  return null;
}

export function checkUsage(user: DBUser) {
  const plan = PLANS[user.plan as PlanId] || PLANS.free;
  if (plan.dailyLimit === -1) return { allowed: true, remaining: -1 };

  const today = getTodayKey();
  if (!user.usage) user.usage = {};
  const used = user.usage[today] || 0;
  if (used >= plan.dailyLimit) return { allowed: false, error: "limit_reached", remaining: 0 };
  return { allowed: true, remaining: plan.dailyLimit - used };
}

export function recordUsage(user: DBUser) {
  const today = getTodayKey();
  if (!user.usage) user.usage = {};
  user.usage[today] = (user.usage[today] || 0) + 1;

  // 仅保留最近 ~30 天（粗略）
  for (const k of Object.keys(user.usage)) {
    if (k < getTodayKey().slice(0, 8)) delete user.usage[k];
  }
}

export function usageSnapshot(user: DBUser): UsageSnapshot {
  const plan = PLANS[user.plan as PlanId] || PLANS.free;
  const today = getTodayKey();
  const used = user.usage?.[today] || 0;
  return {
    used,
    limit: plan.dailyLimit,
    remaining: plan.dailyLimit === -1 ? -1 : Math.max(0, plan.dailyLimit - used),
    plan: user.plan,
  };
}

