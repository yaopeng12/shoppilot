"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { Toast } from "@/components/tiktok-adgen/toast";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { Navbar } from "@/components/tiktok-adgen/navbar";

type MeData = {
  id: string;
  email: string;
  name: string;
  plan: PlanId;
  planInfo: (typeof PLANS)[PlanId];
  apiKey: string | null;
  usage: { used: number; limit: number; remaining: number; plan: PlanId };
  createdAt: number;
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { message: toast, showToast } = useToast();
  const [me, setMe] = useState<MeData | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      apiFetch<MeData>("/api/user/me").then((r) => {
        if (r.ok) setMe(r.data);
      });
    }
  }, [isLoaded, user]);

  async function upgradePlan(plan: string) {
    setUpgrading(plan);
    try {
      const r = await apiFetch("/api/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      if (r.ok) {
        showToast("已升级");
        const refresh = await apiFetch<MeData>("/api/user/me");
        if (refresh.ok) setMe(refresh.data);
      } else {
        showToast("升级失败");
      }
    } catch {
      showToast("网络错误");
    } finally {
      setUpgrading(null);
    }
  }

  async function copyApiKey() {
    if (!me?.apiKey) return;
    try {
      await navigator.clipboard.writeText(me.apiKey);
      showToast("已复制 API Key");
    } catch {
      showToast("复制失败");
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/30 text-sm">加载中...</div>
      </div>
    );
  }

  const plan = me?.plan || "free";
  const planInfo = PLANS[plan];
  const usage = me?.usage;
  const usagePct = usage && usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  const stats = [
    { label: "当前方案", value: planInfo?.name || "Free" },
    { label: "今日已用", value: usage ? String(usage.used) : "0" },
    { label: "今日剩余", value: usage ? (usage.remaining === -1 ? "无限" : String(usage.remaining)) : "—" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar isSignedIn={!!user} />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">用户中心</h1>
          <p className="text-sm text-white/35 mt-1">管理你的账户和订阅</p>
        </div>

        {/* User info */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-xl font-bold text-white/70 shrink-0">
              {(user.firstName || user.emailAddresses[0]?.emailAddress || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold truncate">{user.firstName || user.username || "用户"}</div>
              <div className="text-sm text-white/40 truncate">{user.emailAddresses[0]?.emailAddress}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-white/35 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Usage bar */}
        {usage && usage.limit > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">今日用量</span>
              <span className="text-sm text-white/60">{usage.used} / {usage.limit}</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(usagePct, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* API Key */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">API Key</div>
            <button type="button" onClick={copyApiKey} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              复制
            </button>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm text-white/50 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 font-mono truncate">
              {showKey ? me?.apiKey || "未生成" : "••••••••••••••••••••••••••••••••"}
            </code>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="shrink-0 h-10 px-4 rounded-xl border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-xs"
            >
              {showKey ? "隐藏" : "显示"}
            </button>
          </div>
          <p className="text-[11px] text-white/25 mt-2">API Key 会在首次生成内容时自动创建</p>
        </div>

        {/* Plan upgrade */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="text-sm font-medium mb-4">升级方案</div>
          <div className="grid sm:grid-cols-3 gap-3">
            {Object.entries(PLANS).map(([pid, p]) => {
              const isCurrent = plan === pid;
              const isPopular = pid === "pro";
              return (
                <div
                  key={pid}
                  className={`rounded-xl border p-4 transition-all duration-300 relative ${
                    isCurrent ? "border-violet-500/40 bg-violet-500/[0.05]" : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-[9px] font-medium tracking-wide">
                      POPULAR
                    </div>
                  )}
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-2xl font-bold mt-1">${p.price}</div>
                  <div className="text-[11px] text-white/30">{pid === "free" ? "永久免费" : "/月"}</div>
                  <ul className="mt-3 space-y-1.5">
                    {p.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/45">
                        <span className="text-emerald-400 mt-0.5">
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    {isCurrent ? (
                      <div className="w-full py-2 rounded-lg bg-white/[0.06] text-white/35 text-xs text-center cursor-default border border-white/[0.06]">
                        当前方案
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={upgrading === pid}
                        onClick={() => upgradePlan(pid)}
                        className={`w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
                          upgrading === pid
                            ? "bg-white/[0.08] text-white/40 cursor-not-allowed"
                            : isPopular
                              ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20"
                              : "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
                        }`}
                      >
                        {upgrading === pid ? "处理中..." : `升级到 ${p.name}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Toast message={toast} />
    </div>
  );
}
