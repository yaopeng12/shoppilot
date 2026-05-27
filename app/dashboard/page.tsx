"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { Toast } from "@/components/tiktok-adgen/toast";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";
import { useI18n } from "@/lib/i18n/context";

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

type GenerationRecord = {
  id: string;
  product_title: string | null;
  product_price: string | null;
  product_image: string | null;
  style: string | null;
  category: string | null;
  hooks: string[];
  created_at: string;
};

const copy = {
  en: {
    loading: "Loading...",
    welcome: "Pet cleaning command center",
    subtitle: "Track usage, manage your plan, and revisit every generated ad pack.",
    plan: "Plan",
    todayUsed: "Used today",
    remaining: "Remaining",
    unlimited: "Unlimited",
    adPacks: "Ad packs",
    quickGenerate: "Generate new ad pack",
    quickGenerateDesc: "Start from a product or competitor link.",
    templateLibrary: "Template research",
    templateLibraryDesc: "Review pet-cleaning video structures.",
    pricing: "Upgrade plan",
    pricingDesc: "Unlock more ad packs and team workflows.",
    apiTitle: "API key",
    apiDesc: "Use this key for integrations when API access is enabled.",
    show: "Show",
    hide: "Hide",
    copy: "Copy",
    copied: "API key copied",
    copyFailed: "Copy failed",
    notGenerated: "Not generated yet",
    apiHint: "The key is created automatically for your account.",
    historyTitle: "Ad Pack History",
    historyDesc: "Recently generated pet cleaning ad packs.",
    noHistory: "No ad packs yet",
    noHistoryHint: "Generate your first pet cleaning ad pack and it will appear here.",
    openGenerator: "Open generator",
    template: "Template",
    scenario: "Scenario",
    firstHook: "First hook",
    plansTitle: "Plan options",
    current: "Current",
    popular: "Popular",
    upgradeTo: "Upgrade to",
    processing: "Processing...",
    upgraded: "Upgraded",
    upgradeFailed: "Upgrade failed",
    networkError: "Network error",
    perMonth: "/month",
    freeForever: "Free forever",
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
      team: ["Everything in Pro", "Up to 10 members", "Shared template workflow", "Team creative library", "Admin dashboard", "API access"],
    },
  },
  zh: {
    loading: "加载中...",
    welcome: "宠物清洁广告工作台",
    subtitle: "查看用量、管理方案，并回看每一次生成的广告包。",
    plan: "当前方案",
    todayUsed: "今日已用",
    remaining: "今日剩余",
    unlimited: "无限",
    adPacks: "广告包",
    quickGenerate: "生成新广告包",
    quickGenerateDesc: "从商品或竞品链接开始。",
    templateLibrary: "模板研究",
    templateLibraryDesc: "查看宠物清洁视频结构。",
    pricing: "升级方案",
    pricingDesc: "解锁更多广告包和团队工作流。",
    apiTitle: "API 密钥",
    apiDesc: "开启 API 能力后可用于集成。",
    show: "显示",
    hide: "隐藏",
    copy: "复制",
    copied: "API 密钥已复制",
    copyFailed: "复制失败",
    notGenerated: "尚未生成",
    apiHint: "密钥会随账户自动创建。",
    historyTitle: "广告包历史",
    historyDesc: "最近生成的宠物清洁广告包。",
    noHistory: "暂无广告包",
    noHistoryHint: "生成第一个宠物清洁广告包后会显示在这里。",
    openGenerator: "打开生成器",
    template: "模板",
    scenario: "场景",
    firstHook: "首个 Hook",
    plansTitle: "方案选择",
    current: "当前方案",
    popular: "热门",
    upgradeTo: "升级到",
    processing: "处理中...",
    upgraded: "已升级",
    upgradeFailed: "升级失败",
    networkError: "网络错误",
    perMonth: "/月",
    freeForever: "永久免费",
    features: {
      free: ["每天 3 次广告包生成", "货源匹配评分", "宠物清洁模板", "Hook + UGC 脚本"],
      pro: ["不限次数生成广告包", "货源匹配评分", "宠物清洁模板", "Hook + UGC 脚本", "合规表达建议", "JSON 和 Markdown 导出"],
      team: ["包含 Pro 全部功能", "最多 10 名成员", "共享模板工作流", "团队创意库", "管理后台", "API 接入"],
    },
  },
} as const;

const scenarioLabels: Record<string, { en: string; zh: string }> = {
  cat_litter_odor: { en: "Cat litter odor", zh: "猫砂盆异味" },
  cat_urine_cleanup: { en: "Cat urine cleanup", zh: "猫尿清洁" },
  litter_tracking: { en: "Litter tracking", zh: "猫砂带出" },
  pet_hair_cleanup: { en: "Pet hair cleanup", zh: "宠物毛发清理" },
  fabric_odor: { en: "Fabric odor", zh: "织物异味" },
  dog_pad_floor: { en: "Dog pad floor", zh: "狗狗尿垫地板" },
};

type DashboardLabels = (typeof copy)["en"] | (typeof copy)["zh"];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const { locale } = useI18n();
  const t = copy[locale];
  const { message: toast, showToast } = useToast();
  const [me, setMe] = useState<MeData | null>(null);
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [showKey, setShowKey] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !user) return;

    apiFetch<MeData>("/api/user/me").then((response) => {
      if (response.ok) setMe(response.data);
    });

    apiFetch<{ generations: GenerationRecord[] }>("/api/generations").then((response) => {
      if (response.ok) setGenerations(response.data?.generations || []);
    });
  }, [status, user]);

  const usage = me?.usage;
  const plan = me?.plan || "free";
  const planInfo = PLANS[plan];
  const usagePercent = useMemo(() => {
    if (!usage || usage.limit <= 0) return 0;
    return Math.min(100, Math.round((usage.used / usage.limit) * 100));
  }, [usage]);

  async function copyApiKey() {
    if (!me?.apiKey) return;
    try {
      await navigator.clipboard.writeText(me.apiKey);
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed);
    }
  }

  async function upgradePlan(nextPlan: string) {
    setUpgrading(nextPlan);
    try {
      const response = await apiFetch("/api/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan: nextPlan }),
      });
      if (response.ok) {
        showToast(t.upgraded);
        const refresh = await apiFetch<MeData>("/api/user/me");
        if (refresh.ok) setMe(refresh.data);
      } else {
        showToast(t.upgradeFailed);
      }
    } catch {
      showToast(t.networkError);
    } finally {
      setUpgrading(null);
    }
  }

  if (status === "loading" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-white/35">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar isSignedIn={!!user} user={user} />

      <main className="mx-auto max-w-6xl space-y-7 px-6 py-8">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.08] text-xl font-bold text-emerald-100">
                {(user.name || user.email || "?")[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{t.welcome}</h1>
                <p className="mt-1 text-sm text-white/45">{t.subtitle}</p>
                <p className="mt-1 text-xs text-white/30">{user.email}</p>
              </div>
            </div>
            <Link
              href="/storyboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              {t.openGenerator}
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label={t.plan} value={planInfo?.name || "Free"} />
          <MetricCard label={t.todayUsed} value={`${usage?.used || 0} ${t.adPacks}`} />
          <MetricCard label={t.remaining} value={usage?.remaining === -1 ? t.unlimited : String(usage?.remaining || 0)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">{t.todayUsed}</h2>
                <p className="mt-1 text-xs text-white/35">
                  {usage?.limit === -1 ? t.unlimited : `${usagePercent}%`}
                </p>
              </div>
              <div className="text-2xl font-bold text-emerald-200">{usage?.used || 0}</div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500" style={{ width: usage?.limit === -1 ? "100%" : `${usagePercent}%` }} />
            </div>

            <div className="mt-6 grid gap-3">
              <QuickAction href="/storyboard" title={t.quickGenerate} desc={t.quickGenerateDesc} />
              <QuickAction href="/inspiration" title={t.templateLibrary} desc={t.templateLibraryDesc} />
              <QuickAction href="/pricing" title={t.pricing} desc={t.pricingDesc} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">{t.apiTitle}</h2>
              <p className="mt-1 text-xs text-white/35">{t.apiDesc}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <code className="min-w-0 flex-1 truncate rounded-xl border border-white/[0.06] bg-white/[0.035] px-4 py-3 font-mono text-sm text-white/55">
                {showKey ? me?.apiKey || t.notGenerated : "••••••••••••••••••••••••••••••••"}
              </code>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowKey((value) => !value)}
                  className="h-11 rounded-xl border border-white/[0.1] px-4 text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {showKey ? t.hide : t.show}
                </button>
                <button
                  type="button"
                  onClick={copyApiKey}
                  disabled={!me?.apiKey}
                  className="h-11 rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.copy}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-white/25">{t.apiHint}</p>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{t.historyTitle}</h2>
              <p className="mt-1 text-sm text-white/38">{t.historyDesc}</p>
            </div>
            <Link href="/storyboard" className="hidden text-xs text-emerald-200/75 transition hover:text-emerald-100 sm:inline">
              {t.openGenerator}
            </Link>
          </div>

          {generations.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-9 text-center">
              <div className="text-sm text-white/45">{t.noHistory}</div>
              <div className="mt-1 text-xs text-white/25">{t.noHistoryHint}</div>
              <Link
                href="/storyboard"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/90"
              >
                {t.openGenerator}
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {generations.slice(0, 8).map((generation) => (
                <HistoryCard key={generation.id} generation={generation} locale={locale} labels={t} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.plansTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(PLANS).map(([id, planOption]) => {
              const planId = id as PlanId;
              const isCurrent = planId === plan;
              const isPopular = planId === "pro";

              return (
                <div
                  key={planId}
                  className={`relative rounded-2xl border p-5 ${
                    isCurrent ? "border-emerald-400/35 bg-emerald-400/[0.055]" : "border-white/[0.08] bg-white/[0.025]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 px-3 py-0.5 text-[10px] font-semibold">
                      {t.popular}
                    </div>
                  )}
                  <div className="text-sm font-semibold">{planOption.name}</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${planOption.price}</span>
                    {planId !== "free" && <span className="text-xs text-white/35">{t.perMonth}</span>}
                  </div>
                  <div className="mt-1 text-xs text-white/30">{planId === "free" ? t.freeForever : t.perMonth}</div>
                  <ul className="mt-4 space-y-2">
                    {t.features[planId].map((feature) => (
                      <li key={feature} className="flex gap-2 text-xs leading-5 text-white/52">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/70" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    {isCurrent ? (
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.06] py-2.5 text-center text-xs text-white/45">
                        {t.current}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={upgrading === planId}
                        onClick={() => upgradePlan(planId)}
                        className={`w-full rounded-xl py-2.5 text-xs font-semibold transition ${
                          isPopular ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white" : "bg-white text-black"
                        } disabled:cursor-not-allowed disabled:opacity-45`}
                      >
                        {upgrading === planId ? t.processing : `${t.upgradeTo} ${planOption.name}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Toast message={toast} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="text-xs text-white/35">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function QuickAction({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:bg-white/[0.05]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white/85">{title}</div>
          <div className="mt-1 text-xs leading-5 text-white/35">{desc}</div>
        </div>
        <span className="text-white/25 transition group-hover:text-white/55">-&gt;</span>
      </div>
    </Link>
  );
}

function HistoryCard({
  generation,
  locale,
  labels,
}: {
  generation: GenerationRecord;
  locale: "en" | "zh";
  labels: DashboardLabels;
}) {
  const scenario = generation.category
    ? scenarioLabels[generation.category]?.[locale] || generation.category.replace(/_/g, " ")
    : "-";

  return (
    <Link
      href="/storyboard"
      className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-white/[0.15] hover:bg-white/[0.045] sm:grid-cols-[72px_1fr_auto]"
    >
      {generation.product_image ? (
        <img
          src={generation.product_image}
          alt={generation.product_title || "Product"}
          className="h-[72px] w-[72px] rounded-xl border border-white/[0.08] object-cover"
        />
      ) : (
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-white/[0.08] bg-emerald-400/[0.06] text-xs text-emerald-100/45">
          Ad
        </div>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-white/90">{generation.product_title || "Pet Cleaning Ad Pack"}</h3>
          {generation.product_price && <span className="text-xs text-emerald-200/75">{generation.product_price}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          {generation.style && (
            <span className="rounded-full border border-blue-300/15 bg-blue-300/[0.06] px-2.5 py-1 text-blue-100/65">
              {labels.template}: {generation.style}
            </span>
          )}
          <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 text-emerald-100/65">
            {labels.scenario}: {scenario}
          </span>
        </div>
        {generation.hooks?.[0] && (
          <p className="mt-2 truncate text-xs text-white/38">
            {labels.firstHook}: {generation.hooks[0]}
          </p>
        )}
      </div>
      <div className="text-xs text-white/30 sm:text-right">
        {new Date(generation.created_at).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </Link>
  );
}
