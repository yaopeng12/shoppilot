"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { Toast } from "@/components/tiktok-adgen/toast";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";
import { useI18n } from "@/lib/i18n/context";

const planCopy = {
  en: {
    freeNote: "Free forever, no credit card",
    processing: "Processing...",
    upgraded: "Upgraded",
    upgradeFailed: "Upgrade failed",
    networkError: "Network error",
    language: "Language",
    features: {
      free: ["3 ad packs/day", "Source match scoring", "Pet cleaning templates", "Hooks + UGC scripts"],
      pro: [
        "Unlimited ad packs",
        "Source match scoring",
        "Pet cleaning templates",
        "Hooks + UGC scripts",
        "Claim safety guidance",
        "JSON and Markdown export",
      ],
    },
  },
  zh: {
    freeNote: "永久免费，无需信用卡",
    processing: "处理中...",
    upgraded: "已升级",
    upgradeFailed: "升级失败",
    networkError: "网络错误",
    language: "语言",
    features: {
      free: ["每天 3 次广告包生成", "货源匹配评分", "宠物清洁模板", "Hook + UGC 脚本"],
      pro: [
        "不限次数生成广告包",
        "货源匹配评分",
        "宠物清洁模板",
        "Hook + UGC 脚本",
        "合规表达建议",
        "JSON 和 Markdown 导出",
      ],
      team: ["包含 Pro 全部功能", "最多 10 名成员", "共享模板工作流", "团队创意库", "管理后台", "API 接入"],
    },
  },
} as const;

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const { t, locale } = useI18n();
  const local = planCopy[locale];
  const { message: toast, showToast } = useToast();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");

  useEffect(() => {
    if (!user) return;
    apiFetch<{ plan: PlanId }>("/api/user/me").then((response) => {
      if (response.ok) setCurrentPlan(response.data.plan);
    });
  }, [user]);

  async function upgradePlan(plan: string) {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setUpgrading(plan);
    try {
      const response = await apiFetch("/api/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      if (response.ok) {
        showToast(local.upgraded);
        setCurrentPlan(plan as PlanId);
      } else {
        showToast(local.upgradeFailed);
      }
    } catch {
      showToast(local.networkError);
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar isSignedIn={!!user} user={user} />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-14 text-center">
          <div className="mb-6 inline-flex rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs uppercase tracking-wide text-white/40">
            {t.pricing.badge}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
            <span className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-transparent">
              {t.pricing.title}
            </span>
          </h1>
          <p className="mx-auto max-w-lg text-base leading-7 text-white/45">{t.pricing.desc}</p>
          <p className="mt-4 text-xs text-white/30">
            {local.language}: {locale === "zh" ? "中文" : "English"}
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          {Object.entries(PLANS).map(([pid, plan]) => {
            const planId = pid as PlanId;
            const isCurrent = currentPlan === planId;
            const isPopular = planId === "pro";
            const features = local.features[planId];

            return (
              <div
                key={planId}
                className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ${
                  isCurrent
                    ? "border-emerald-500/40 bg-emerald-500/[0.05] shadow-lg shadow-emerald-500/10"
                    : isPopular
                      ? "border-white/[0.14] bg-white/[0.04]"
                      : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-1 text-[11px] font-semibold tracking-wide shadow-lg shadow-emerald-500/20">
                    {t.pricing.popular}
                  </div>
                )}

                <div>
                  <div className="text-base font-semibold">{plan.name}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                    {planId !== "free" && <span className="text-sm text-white/30">{t.pricing.perMonth}</span>}
                  </div>
                  <div className="mt-1 text-xs text-white/30">
                    {planId === "free" ? local.freeNote : t.pricing.billedMonthly}
                  </div>
                </div>

                <div className="my-6 border-t border-white/[0.06]" />

                <ul className="flex-1 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-white/55">
                      <span className="mt-0.5 shrink-0 text-emerald-400">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isCurrent ? (
                    <div className="w-full rounded-xl border border-white/[0.06] bg-white/[0.06] py-3 text-center text-sm font-medium text-white/40">
                      {t.pricing.currentPlan}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={upgrading === planId}
                      onClick={() => upgradePlan(planId)}
                      className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                        upgrading === planId
                          ? "cursor-not-allowed bg-white/[0.08] text-white/40"
                          : isPopular
                            ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-blue-500"
                            : "bg-white text-black shadow-lg shadow-white/10 hover:bg-white/90"
                      }`}
                    >
                      {upgrading === planId
                        ? local.processing
                        : planId === "free"
                          ? t.pricing.freeStart
                          : `${t.pricing.upgradeTo} ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Toast message={toast} />
    </div>
  );
}
