"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { Toast } from "@/components/tiktok-adgen/toast";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { Navbar } from "@/components/tiktok-adgen/navbar";
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

const dashboardI18n = {
  en: {
    welcome: "Welcome back",
    manageAccount: "Manage your account, usage, and subscription",
    overview: "Overview",
    currentPlan: "Current Plan",
    todayUsed: "Today's Usage",
    todayRemaining: "Remaining",
    unlimited: "Unlimited",
    usageTitle: "Daily Usage",
    usageDesc: "Resets every day at midnight",
    progressLabel: "of daily limit used",
    quickActions: "Quick Actions",
    generateAd: "Generate Ad Creative",
    generateAdDesc: "Paste a Shopify link and get TikTok-ready content",
    viewPricing: "View Plans",
    viewPricingDesc: "Upgrade for more generations and features",
    apiTitle: "API Key",
    apiDesc: "Use this key to integrate ShopPilot into your own tools",
    copy: "Copy",
    show: "Show",
    hide: "Hide",
    notGenerated: "Not generated yet",
    apiHint: "Auto-generated on first content generation",
    planTitle: "Subscription Plan",
    planDesc: "Choose a plan that fits your store",
    popular: "POPULAR",
    current: "Current Plan",
    upgradeTo: "Upgrade to",
    processing: "Processing...",
    freeForever: "Free forever",
    perMonth: "/month",
    upgraded: "Upgraded",
    upgradeFailed: "Upgrade failed",
    networkError: "Network error",
    copied: "API Key copied",
    copyFailed: "Copy failed",
    loading: "Loading...",
    goToGenerate: "Start Generating",
  },
  zh: {
    welcome: "欢迎回来",
    manageAccount: "管理你的账户、用量和订阅",
    overview: "概览",
    currentPlan: "当前方案",
    todayUsed: "今日已用",
    todayRemaining: "今日剩余",
    unlimited: "无限",
    usageTitle: "今日用量",
    usageDesc: "每天午夜自动重置",
    progressLabel: "的每日额度已使用",
    quickActions: "快捷操作",
    generateAd: "生成广告素材",
    generateAdDesc: "粘贴 Shopify 链接，获取 TikTok 广告内容",
    viewPricing: "查看方案",
    viewPricingDesc: "升级获得更多生成次数和功能",
    apiTitle: "API 密钥",
    apiDesc: "使用此密钥将 ShopPilot 集成到你的工具中",
    copy: "复制",
    show: "显示",
    hide: "隐藏",
    notGenerated: "尚未生成",
    apiHint: "首次生成内容时自动创建",
    planTitle: "订阅方案",
    planDesc: "选择适合你店铺的方案",
    popular: "最受欢迎",
    current: "当前方案",
    upgradeTo: "升级到",
    processing: "处理中...",
    freeForever: "永久免费",
    perMonth: "/月",
    upgraded: "已升级",
    upgradeFailed: "升级失败",
    networkError: "网络错误",
    copied: "已复制 API Key",
    copyFailed: "复制失败",
    loading: "加载中...",
    goToGenerate: "去生成",
  },
} as const;

function RingProgress({ percent, size = 100, stroke = 8 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { locale } = useI18n();
  const t = dashboardI18n[locale];
  const { message: toast, showToast } = useToast();
  const [me, setMe] = useState<MeData | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  async function copyApiKey() {
    if (!me?.apiKey) return;
    try {
      await navigator.clipboard.writeText(me.apiKey);
      setCopied(true);
      showToast(t.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(t.copyFailed);
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/30 text-sm">{t.loading}</div>
      </div>
    );
  }

  const plan = me?.plan || "free";
  const planInfo = PLANS[plan];
  const usage = me?.usage;
  const usagePct = usage && usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  const planColors: Record<string, string> = {
    free: "from-slate-500/20 to-slate-500/10 text-slate-300 border-slate-500/20",
    pro: "from-violet-500/20 to-blue-500/10 text-violet-300 border-violet-500/20",
    team: "from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/20",
  };

  return (
    <div className="min-h-screen">
      <Navbar isSignedIn={!!user} />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-fade-in-up">
        {/* Welcome hero */}
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.06] via-white/[0.02] to-blue-500/[0.04] p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[80px] rounded-full" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-xl font-bold text-white/80 shrink-0 border border-white/[0.08]">
                {(user.firstName || user.emailAddresses[0]?.emailAddress || "?")[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">{t.welcome}，{user.firstName || user.username || "User"}</h1>
                <p className="text-sm text-white/40 mt-0.5">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r border text-sm font-medium ${planColors[plan] || planColors.free}`}>
              <span className="w-2 h-2 rounded-full bg-current opacity-60" />
              {planInfo?.name || "Free"} {t.currentPlan}
            </div>
          </div>
        </div>

        {/* Stats + Usage ring */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Usage ring */}
          <div className="lg:col-span-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <RingProgress percent={usagePct} size={120} stroke={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{usage ? usage.used : 0}</span>
                <span className="text-[10px] text-white/35 mt-0.5">
                  / {usage ? (usage.limit === -1 ? "∞" : usage.limit) : "—"}
                </span>
              </div>
            </div>
            <div className="text-sm font-medium text-white/70">{t.usageTitle}</div>
            <div className="text-[11px] text-white/30 mt-1">{t.usageDesc}</div>
            {usage && usage.limit > 0 && (
              <div className="text-[11px] text-white/40 mt-2">
                {Math.round(usagePct)}% {t.progressLabel}
              </div>
            )}
          </div>

          {/* Overview stats */}
          <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
            {[
              {
                label: t.currentPlan,
                value: planInfo?.name || "Free",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ),
                gradient: "from-violet-500/10 to-violet-500/5",
              },
              {
                label: t.todayUsed,
                value: usage ? String(usage.used) : "0",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ),
                gradient: "from-blue-500/10 to-blue-500/5",
              },
              {
                label: t.todayRemaining,
                value: usage ? (usage.remaining === -1 ? t.unlimited : String(usage.remaining)) : "—",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                gradient: "from-emerald-500/10 to-emerald-500/5",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border border-white/[0.08] bg-gradient-to-br ${s.gradient} p-5 flex flex-col justify-between`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 mb-3">
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                  <div className="text-xs text-white/35 mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/tiktok-adgen"
            className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center shrink-0 group-hover:from-violet-500/30 group-hover:to-blue-500/30 transition-all">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold group-hover:text-white transition-colors">{t.generateAd}</div>
              <div className="text-xs text-white/35 mt-0.5">{t.generateAdDesc}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white/50 transition-colors shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/pricing"
            className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold group-hover:text-white transition-colors">{t.viewPricing}</div>
              <div className="text-xs text-white/35 mt-0.5">{t.viewPricingDesc}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white/50 transition-colors shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* API Key */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium">{t.apiTitle}</div>
              <div className="text-[11px] text-white/30">{t.apiDesc}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <code className="flex-1 text-sm text-white/50 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 font-mono truncate">
              {showKey ? me?.apiKey || t.notGenerated : "••••••••••••••••••••••••••••••••"}
            </code>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="shrink-0 h-10 px-4 rounded-xl border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-xs"
            >
              {showKey ? t.hide : t.show}
            </button>
            <button
              type="button"
              onClick={copyApiKey}
              disabled={!me?.apiKey}
              className="shrink-0 h-10 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all duration-200 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copied ? "✓" : t.copy}
            </button>
          </div>
          <p className="text-[11px] text-white/20 mt-2">{t.apiHint}</p>
        </div>

        {/* Plan upgrade */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium">{t.planTitle}</div>
              <div className="text-xs text-white/30 mt-0.5">{t.planDesc}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(PLANS).map(([pid, p]) => {
              const isCurrent = plan === pid;
              const isPopular = pid === "pro";
              return (
                <div
                  key={pid}
                  className={`rounded-2xl border p-5 transition-all duration-300 relative ${
                    isCurrent
                      ? "border-violet-500/30 bg-gradient-to-b from-violet-500/[0.06] to-transparent"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.14]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-[10px] font-semibold tracking-wide shadow-lg shadow-violet-500/20">
                      {t.popular}
                    </div>
                  )}
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold tracking-tight">${p.price}</span>
                    {pid !== "free" && <span className="text-xs text-white/30">{t.perMonth}</span>}
                  </div>
                  <div className="text-[11px] text-white/25 mt-1">
                    {pid === "free" ? t.freeForever : t.perMonth}
                  </div>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/45">
                        <span className="text-emerald-400 mt-0.5 shrink-0">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl bg-white/[0.06] text-white/35 text-xs text-center cursor-default border border-white/[0.06] font-medium">
                        {t.current}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={upgrading === pid}
                        onClick={() => upgradePlan(pid)}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
                          upgrading === pid
                            ? "bg-white/[0.08] text-white/40 cursor-not-allowed"
                            : isPopular
                              ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-blue-500"
                              : "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
                        }`}
                      >
                        {upgrading === pid ? t.processing : `${t.upgradeTo} ${p.name}`}
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
