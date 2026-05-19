"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { Toast } from "@/components/tiktok-adgen/toast";
import { useToast } from "@/components/tiktok-adgen/use-toast";

export default function PricingPage() {
  const { user, isLoaded } = useUser();
  const { message: toast, showToast } = useToast();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");

  // Fetch current plan from our API if signed in
  useState(() => {
    if (user) {
      apiFetch<{ plan: PlanId }>("/api/user/me").then((r) => {
        if (r.ok) setCurrentPlan(r.data.plan);
      });
    }
  });

  async function upgradePlan(plan: string) {
    if (!user) {
      window.location.href = "/sign-in";
      return;
    }
    setUpgrading(plan);
    try {
      const r = await apiFetch("/api/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      if (r.ok) {
        showToast("已升级");
        setCurrentPlan(plan as PlanId);
      } else {
        showToast("升级失败");
      }
    } catch {
      showToast("网络错误");
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#06060a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            ShopPilot
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="h-8 px-3.5 rounded-lg border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-xs inline-flex items-center"
                >
                  仪表盘
                </Link>
                <UserButton />
              </>
            ) : (
              <Link
                href="/sign-in"
                className="h-8 px-4 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all duration-200 inline-flex items-center"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="inline-flex px-4 py-1.5 rounded-full bg-white/[0.04] text-xs text-white/40 mb-6 tracking-wide uppercase border border-white/[0.08]">
            Pricing
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              选择适合你的方案
            </span>
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            从免费开始，随时升级。所有方案均包含核心 AI 功能。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto animate-fade-in-up delay-100">
          {Object.entries(PLANS).map(([pid, p]) => {
            const isCurrent = currentPlan === pid;
            const isPopular = pid === "pro";

            return (
              <div
                key={pid}
                className={`rounded-2xl border p-7 transition-all duration-300 relative flex flex-col ${
                  isCurrent
                    ? "border-violet-500/40 bg-violet-500/[0.05] shadow-lg shadow-violet-500/10"
                    : isPopular
                      ? "border-white/[0.14] bg-white/[0.04]"
                      : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-[11px] font-semibold tracking-wide shadow-lg shadow-violet-500/20">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="text-base font-semibold">{p.name}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">${p.price}</span>
                    {pid !== "free" && <span className="text-sm text-white/30">/月</span>}
                  </div>
                  <div className="text-xs text-white/30 mt-1">
                    {pid === "free" ? "永久免费，无需信用卡" : "按月计费，随时取消"}
                  </div>
                </div>

                <div className="border-t border-white/[0.06] my-6" />

                <ul className="space-y-3 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/55">
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-xl bg-white/[0.06] text-white/40 text-sm text-center cursor-default border border-white/[0.06] font-medium">
                      当前方案
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={upgrading === pid}
                      onClick={() => upgradePlan(pid)}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                        upgrading === pid
                          ? "bg-white/[0.08] text-white/40 cursor-not-allowed"
                          : isPopular
                            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-blue-500"
                            : "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
                      }`}
                    >
                      {upgrading === pid ? "处理中..." : pid === "free" ? "免费开始" : `升级到 ${p.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16 text-xs text-white/25 animate-fade-in-up delay-200">
          <p>所有方案均支持 14 天免费试用 · 无隐藏费用 · 随时取消</p>
          <p className="mt-1">
            <Link href="/" className="hover:text-white/50 transition-colors">← 返回首页</Link>
          </p>
        </div>
      </main>

      <Toast message={toast} />
    </div>
  );
}
