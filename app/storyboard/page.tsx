"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Navbar } from "@/components/tiktok-adgen/navbar";
import { Toast } from "@/components/tiktok-adgen/toast";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { normalizeUrl } from "@/components/tiktok-adgen/utils";
import { cn } from "@/components/ui/cn";
import { PetAdPackGenerateForm } from "@/components/pet-ad-pack/generate-form";
import { PetAdPackView } from "@/components/pet-ad-pack/ad-pack-view";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { useI18n } from "@/lib/i18n/context";
import { DEFAULT_TARGET_MARKET, type TargetMarketCode } from "@/lib/localization/markets";
import type { PetAdPack } from "@/lib/pet-ad-pack/types";

type PetAdPackResponse = PetAdPack & {
  error?: string;
  message?: string;
};

const copy = {
  en: {
    badge: "Pet cleaning growth workstation",
    title: "Generate a Pet Cleaning Ad Pack",
    desc: "Paste a product or competitor link. ShopPilot detects the pet-cleaning scenario, selects the highest-scoring 1688-style source candidate, matches a proven template, and builds a shoot-ready ad pack.",
    enterUrl: "Please enter a product or competitor link",
    invalidUrl: "Please enter a valid URL",
    generated: "Pet Cleaning Ad Pack generated",
    genFailed: "Generation failed",
    limitReached: "Daily limit reached.",
    unlimited: "Unlimited",
    remaining: "remaining today",
    workflow: [
      ["Source", "Auto-scores candidate suppliers by fit, demand, margin, demo value, and compliance safety."],
      ["Template", "Matches the best pet cleaning structure from cat odor, urine cleanup, litter tracking, fur, and fabric odor patterns."],
      ["Ad Pack", "Outputs hooks, scripts, storyboard, shot list, AI video prompts, captions, claims, and A/B tests."],
    ],
    form: {
      url: "Product / competitor link",
      urlPlaceholder: "Paste Shopify, Amazon, TikTok, or competitor product URL...",
      note: "Optional signal",
      notePlaceholder: "e.g. cat litter smell, Japan market, multi-cat home",
      market: "Target market",
      marketHint: "Localizes hooks, scripts, captions, CTA, and template examples beyond direct translation.",
      generate: "Generate Pet Cleaning Ad Pack",
      generating: "Generating...",
      try: "Try:",
    },
    results: {
      autoSource: "Auto-selected source candidate",
      score: "overall score",
      why: "Why this source was selected",
      sourceSearch: "Open 1688 search",
      alternatives: "Backup source candidates",
      strategy: "Creative Strategy",
      template: "Matched Template",
      hooks: "Hook Matrix",
      scripts: "UGC Scripts",
      storyboard: "Storyboard",
      shotList: "Shot List",
      captions: "Caption Lines",
      voiceover: "Voiceover",
      videoPrompts: "AI Video Prompts",
      compliance: "Claim Safety",
      testing: "A/B Testing Plan",
      exportJson: "Export JSON",
      exportMarkdown: "Export Markdown",
      safeClaims: "Safe claims",
      avoidClaims: "Avoid",
      saferPhrases: "Safer phrases",
      localization: "Localization Strategy",
      targetMarket: "Target market",
      language: "Language",
      creatorVoice: "Creator voice",
      culturalNotes: "Cultural notes",
    },
  },
  zh: {
    badge: "宠物清洁投放一体化工具",
    title: "生成 Pet Cleaning Ad Pack",
    desc: "粘贴商品或竞品链接，系统自动识别宠物清洁场景，选择综合评分最高的 1688 候选货源，匹配爆款视频模板，并生成可拍摄、可投放、可测试的广告包。",
    enterUrl: "请输入商品或竞品链接",
    invalidUrl: "请输入有效 URL",
    generated: "Pet Cleaning Ad Pack 已生成",
    genFailed: "生成失败",
    limitReached: "今日次数已用完。",
    unlimited: "无限",
    remaining: "今日剩余",
    workflow: [
      ["选货源", "按匹配度、需求热度、利润空间、演示价值和合规安全自动评分。"],
      ["套模板", "自动匹配猫砂除味、猫尿清洁、猫砂带出、宠物毛发、织物异味等爆款结构。"],
      ["出广告包", "一次输出 Hook、UGC 脚本、分镜、镜头清单、AI 视频提示词、字幕、合规和 A/B 测试。"],
    ],
    form: {
      url: "商品 / 竞品链接",
      urlPlaceholder: "粘贴 Shopify、Amazon、TikTok 或竞品商品 URL...",
      note: "可选补充",
      notePlaceholder: "例如：猫砂盆异味、日本市场、多猫家庭",
      market: "目标市场",
      marketHint: "按当地 TikTok 口语、文化语境和表达禁忌本地化生成内容。",
      generate: "生成宠物清洁广告包",
      generating: "生成中...",
      try: "试试：",
    },
    results: {
      autoSource: "自动选择的候选货源",
      score: "综合评分",
      why: "选择原因",
      sourceSearch: "打开 1688 搜索",
      alternatives: "备选货源",
      strategy: "创意策略",
      template: "匹配模板",
      hooks: "Hook 矩阵",
      scripts: "UGC 脚本",
      storyboard: "视频分镜",
      shotList: "拍摄镜头清单",
      captions: "字幕文案",
      voiceover: "口播文案",
      videoPrompts: "AI 视频提示词",
      compliance: "合规表达",
      testing: "A/B 测试计划",
      exportJson: "导出 JSON",
      exportMarkdown: "导出 Markdown",
      safeClaims: "可用表达",
      avoidClaims: "避免表达",
      saferPhrases: "更安全说法",
      localization: "本地化策略",
      targetMarket: "目标市场",
      language: "语言",
      creatorVoice: "创作者语气",
      culturalNotes: "文化注意事项",
    },
  },
} as const;

export default function PetAdPackPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { locale } = useI18n();
  const t = copy[locale];
  const { message: toast, showToast } = useToast();

  const [url, setUrl] = useState("");
  const [userNote, setUserNote] = useState("");
  const [targetMarket, setTargetMarket] = useState<TargetMarketCode>(DEFAULT_TARGET_MARKET);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<PetAdPack | null>(null);

  const usage = data?._usage;
  const usagePill = useMemo(() => {
    if (!usage) return null;
    if (usage.remaining === -1) return { text: t.unlimited, color: "bg-emerald-500" };
    const pct = usage.limit ? usage.remaining / usage.limit : 0;
    const color = pct > 0.5 ? "bg-emerald-500" : pct > 0.2 ? "bg-yellow-400" : "bg-rose-500";
    return { text: `${usage.remaining}/${usage.limit} ${t.remaining}`, color };
  }, [usage, t]);

  async function generate() {
    setErr(null);
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setErr(t.enterUrl);
      return;
    }
    try {
      new URL(normalized);
    } catch {
      setErr(t.invalidUrl);
      return;
    }

    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<PetAdPackResponse>("/api/pet-ad-pack", {
        method: "POST",
        body: JSON.stringify({ url: normalized, userNote, targetMarket }),
      });
      if (response.status === 429) throw new Error(response.data.message || t.limitReached);
      if (!response.ok) throw new Error(response.data.error || t.genFailed);

      setData(response.data);
      showToast(t.generated);
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : t.genFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar isSignedIn={!!session?.user} user={session?.user} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7 grid gap-7 lg:grid-cols-[1fr_0.92fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3.5 py-1.5 text-xs text-emerald-100/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {t.badge}
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">{t.desc}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {t.workflow.map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="text-sm font-semibold text-white">{title}</div>
                <p className="mt-2 text-xs leading-5 text-white/42">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {usagePill && (
          <div className="mb-4 flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/60">
              <span className={cn("h-1.5 w-1.5 rounded-full", usagePill.color)} />
              <span className="whitespace-nowrap">{usagePill.text}</span>
            </div>
          </div>
        )}

        <PetAdPackGenerateForm
          url={url}
          userNote={userNote}
          targetMarket={targetMarket}
          loading={loading}
          err={err}
          labels={t.form}
          onUrlChange={setUrl}
          onUserNoteChange={setUserNote}
          onTargetMarketChange={setTargetMarket}
          onGenerate={generate}
          onExample={(exampleUrl, note) => {
            setUrl(exampleUrl);
            if (note) setUserNote(note);
          }}
        />

        {data && (
          <div className="mt-9">
            <PetAdPackView data={data} labels={t.results} />
          </div>
        )}
      </main>

      <Toast message={toast} />
    </div>
  );
}
