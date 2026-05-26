"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { Toast } from "@/components/tiktok-adgen/toast";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const { t, locale } = useI18n();
  const { message: toast, showToast } = useToast();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");

  useEffect(() => {
    if (user) {
      apiFetch<{ plan: PlanId }>("/api/user/me").then((r) => {
        if (r.ok) setCurrentPlan(r.data.plan);
      });
    }
  }, [user]);

  async function upgradePlan(plan: string) {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    setUpgrading(plan);
    try {
      const r = await apiFetch("/api/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      if (r.ok) {
        showToast(locale === "zh" ? "已升级" : "Upgraded");
        setCurrentPlan(plan as PlanId);
      } else {
        showToast(locale === "zh" ? "升级失败" : "Upgrade failed");
      }
    } catch {
      showToast(locale === "zh" ? "网络错误" : "Network error");
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar isSignedIn={!!user} user={user} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="inline-flex px-4 py-1.5 rounded-full bg-white/[0.04] text-xs text-white/40 mb-6 tracking-wide uppercase border border-white/[0.08]">
            {t.pricing.badge}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              {t.pricing.title}
            </span>
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            {t.pricing.desc}
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
                    {t.pricing.popular}
                  </div>
                )}

                <div>
                  <div className="text-base font-semibold">{p.name}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">${p.price}</span>
                    {pid !== "free" && <span className="text-sm text-white/30">{t.pricing.perMonth}</span>}
                  </div>
                  <div className="text-xs text-white/30 mt-1">
                    {pid === "free"
                      ? (locale === "zh" ? "永久免费，无需信用卡" : "Free forever, no credit card")
                      : t.pricing.billedMonthly}
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
                      {t.pricing.currentPlan}
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
                      {upgrading === pid
                        ? (locale === "zh" ? "处理中..." : "Processing...")
                        : pid === "free"
                          ? t.pricing.freeStart
                          : `${t.pricing.upgradeTo} ${p.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10 text-sm text-white/30 animate-fade-in-up delay-200">
          {t.pricing.yearlyDiscount}
        </div>
      </main>

      <Toast message={toast} />
    </div>
  );
}
