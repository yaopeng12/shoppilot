"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { GenerateForm } from "@/components/tiktok-adgen/generate-form";
import { GenerationResults } from "@/components/tiktok-adgen/generation-results";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { PricingModal } from "@/components/tiktok-adgen/pricing-modal";
import { TeamModal } from "@/components/tiktok-adgen/team-modal";
import { Toast } from "@/components/tiktok-adgen/toast";
import type { GeneratedData, GenerateErrorBody, TeamState } from "@/components/tiktok-adgen/types";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { normalizeUrl } from "@/components/tiktok-adgen/utils";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import { PLANS, type PlanId, type PublicUser } from "@/lib/tiktok-adgen/types";
import type { AdStyle, TargetMarket } from "@/lib/tiktok-adgen/generator";

type Plans = typeof PLANS;

const pageI18n = {
  en: {
    badge: "E-commerce → TikTok Ad Creative",
    title: "Generate TikTok Ad Content",
    desc: "Paste a product link from any store and get AI-powered hooks, scripts, voiceovers, and subtitles.",
    unlimited: "Unlimited",
    remaining: "remaining today",
    team: "Team",
    generated: "Generated!",
    copied: "Copied",
    copyFailed: "Copy failed",
    upgraded: "Upgraded (demo)",
    upgradeFailed: "Upgrade failed",
    enterUrl: "Please enter a product link",
    invalidUrl: "Please enter a valid URL",
    limitReached: "Daily limit reached.",
    signInRequired: "Please sign in to generate content.",
    signIn: "Sign in",
    genFailed: "Generation failed",
  },
  zh: {
    badge: "电商 → TikTok 广告素材",
    title: "生成 TikTok 广告内容",
    desc: "粘贴任意店铺商品链接，AI 自动生成 Hook、脚本、配音和字幕。",
    unlimited: "无限",
    remaining: "今日剩余",
    team: "团队",
    generated: "已生成",
    copied: "已复制",
    copyFailed: "复制失败",
    upgraded: "已升级（演示）",
    upgradeFailed: "升级失败",
    enterUrl: "请输入商品链接",
    invalidUrl: "请输入有效的 URL",
    limitReached: "今日次数已用完。",
    signInRequired: "请先登录后再生成内容。",
    signIn: "去登录",
    genFailed: "生成失败",
  },
} as const;

export default function TikTokAdGenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen text-white flex items-center justify-center">Loading...</div>}>
      <TikTokAdGenContent />
    </Suspense>
  );
}

function TikTokAdGenContent() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { locale } = useI18n();
  const t = pageI18n[locale];
  const { message: toast, showToast } = useToast();

  const searchParams = useSearchParams();
  const refVideoId = searchParams.get("refVideoId");

  const [url, setUrl] = useState("");
  const [style, setStyle] = useState<AdStyle | null>(null);
  const [targetMarket, setTargetMarket] = useState<TargetMarket>("us");
  const [scriptCount, setScriptCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [data, setData] = useState<GeneratedData | null>(null);

  const [pricingOpen, setPricingOpen] = useState(false);
  const [plans, setPlans] = useState<Plans | null>(null);

  const [teamOpen, setTeamOpen] = useState(false);
  const [teamState, setTeamState] = useState<TeamState>(null);

  const user: PublicUser | null = useMemo(() => {
    if (!clerkUser) return null;
    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: clerkUser.firstName || clerkUser.username || "",
      plan: (clerkUser.publicMetadata?.plan as PlanId) || "free",
    };
  }, [clerkUser]);

  const usagePill = useMemo(() => {
    const u = data?._usage;
    if (!u) return null;
    if (u.remaining === -1) return { text: t.unlimited, color: "bg-emerald-500" };
    const pct = u.limit ? u.remaining / u.limit : 0;
    const color = pct > 0.5 ? "bg-emerald-500" : pct > 0.2 ? "bg-yellow-400" : "bg-rose-500";
    return { text: `${u.remaining}/${u.limit} ${t.remaining}`, color };
  }, [data?._usage, t]);

  const loadPlans = useCallback(async () => {
    const r = await apiFetch<Plans>("/api/plans", { method: "GET" });
    if (r.ok) setPlans(r.data);
  }, []);

  const openPricing = useCallback(() => {
    setPricingOpen(true);
    loadPlans().catch(() => {});
  }, [loadPlans]);

  async function upgradePlan(plan: PlanId) {
    const r = await apiFetch("/api/upgrade", { method: "POST", body: JSON.stringify({ plan }) });
    if (r.ok) {
      showToast(t.upgraded);
      setPricingOpen(false);
    } else {
      showToast(t.upgradeFailed);
    }
  }

  const refreshTeam = useCallback(async () => {
    const r = await apiFetch<TeamState>("/api/team/info", { method: "GET" });
    setTeamState(r.ok ? r.data : { _empty: true });
  }, []);

  async function openTeam() {
    setTeamOpen(true);
    const r = await apiFetch<TeamState>("/api/team/info", { method: "GET" });
    setTeamState(r.ok ? r.data : { _empty: true });
  }

  async function generate() {
    setErr(null);
    setLimitMsg(null);
    setAuthMsg(null);
    const u = normalizeUrl(url);
    if (!u) { setErr(t.enterUrl); return; }
    try { new URL(u); } catch { setErr(t.invalidUrl); return; }

    if (!clerkUser) { router.push("/sign-in"); return; }

    setLoading(true);
    try {
      const r = await apiFetch<GeneratedData & GenerateErrorBody>("/api/generate", {
        method: "POST",
        body: JSON.stringify({ url: u, style: style || undefined, targetMarket, scriptCount, refVideoId }),
      });
      if (r.status === 429) {
        setLimitMsg(r.data.message || t.limitReached);
        throw new Error(r.data.message || t.limitReached);
      }
      if (!r.ok) throw new Error(r.data.error || t.genFailed);
      setData(r.data);
      showToast(t.generated);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : t.genFailed);
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar isSignedIn={!!clerkUser} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/45 mb-4 tracking-wide">
            {t.badge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-sm text-white/35 mt-2 max-w-lg">{t.desc}</p>
        </div>

        {/* Usage pill */}
        {usagePill && (
          <div className="flex items-center justify-end gap-3 mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/60">
              <span className={cn("w-1.5 h-1.5 rounded-full", usagePill.color)} />
              <span className="whitespace-nowrap">{usagePill.text}</span>
            </div>
            {user?.plan === "team" && (
              <button type="button" className="px-3 py-1.5 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] text-xs transition-all" onClick={openTeam}>
                {t.team}
              </button>
            )}
          </div>
        )}

        <GenerateForm
          url={url}
          style={style}
          targetMarket={targetMarket}
          scriptCount={scriptCount}
          loading={loading}
          err={err}
          limitMsg={limitMsg}
          authMsg={authMsg}
          signInLabel={t.signIn}
          onUrlChange={setUrl}
          onStyleChange={setStyle}
          onMarketChange={setTargetMarket}
          onCountChange={setScriptCount}
          onGenerate={generate}
          onUpgrade={openPricing}
          onExample={setUrl}
        />

        {data && <div className="mt-8"><GenerationResults data={data} onCopy={copyText} /></div>}
      </main>

      <Toast message={toast} />
      <PricingModal open={pricingOpen} plans={plans} user={user} onClose={() => setPricingOpen(false)} onUpgrade={upgradePlan} />
      <TeamModal open={teamOpen} teamState={teamState} onClose={() => setTeamOpen(false)} onRefresh={refreshTeam} onToast={showToast} />
    </div>
  );
}
