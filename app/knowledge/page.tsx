"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { TargetMarketSelect } from "@/components/localization/target-market-select";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { useI18n } from "@/lib/i18n/context";
import { DEFAULT_TARGET_MARKET, type TargetMarketCode } from "@/lib/localization/markets";
import type { KnowledgeEntry } from "@/lib/inspiration/types";
import blogPosts from "@/data/blog-posts.json";

type TabType = "patterns" | "guides";

const pageI18n = {
  en: {
    badge: "Pet Cleaning Knowledge Base",
    title: "Everything you need to create winning pet ads",
    desc: "Browse proven ad patterns, hook angles, and content marketing guides to scale your pet product business.",
    tabPatterns: "Ad Patterns",
    tabGuides: "Marketing Guides",
    // Patterns tab
    insight: "Pattern intelligence",
    categories: "scenarios",
    videos: "source videos",
    hooks: "hook patterns",
    avgDuration: "avg seconds",
    market: "Knowledge market",
    marketHint: "Localizes hook examples, CTA, tone, and structure notes.",
    spotlight: "Top scenario spotlight",
    generate: "Generate ad pack",
    viewResearch: "View template research",
    noData: "No knowledge entries yet. Add or import pet cleaning video research first.",
    hookPatterns: "High-signal hooks",
    structures: "Reusable video structures",
    ctas: "CTA language",
    tones: "Creative tone",
    hashtags: "Hashtags",
    videosAnalyzed: "videos analyzed",
    seconds: "s",
    bestFor: "Best for",
    benchmark: "Benchmark",
    // Guides tab
    guidesTitle: "Content Marketing Guides",
    guidesDesc: "Step-by-step tutorials on TikTok ads, dropshipping, UGC scripts, and Shopify marketing.",
    readArticle: "Read article",
    minRead: "min",
    guidesCta: "Want to apply these tips?",
    guidesCtaDesc: "Use ShopPilot to generate ad packs based on what you learned.",
  },
  zh: {
    badge: "宠物清洁知识库",
    title: "打造爆款宠物广告所需的一切",
    desc: "浏览经过验证的广告模式、Hook 角度和内容营销指南，助力你的宠物业务增长。",
    tabPatterns: "广告模板",
    tabGuides: "营销指南",
    // 广告模板 tab
    insight: "结构洞察",
    categories: "细分场景",
    videos: "来源视频",
    hooks: "Hook 模式",
    avgDuration: "平均秒数",
    market: "知识库市场",
    marketHint: "按目标市场本地化 Hook 示例、CTA、语气和结构说明。",
    spotlight: "重点场景",
    generate: "生成广告包",
    viewResearch: "查看模板研究",
    noData: "暂无知识库内容，请先导入或分析宠物清洁视频。",
    hookPatterns: "高信号 Hook",
    structures: "可复用视频结构",
    ctas: "CTA 话术",
    tones: "创意语气",
    hashtags: "热门标签",
    videosAnalyzed: "条视频已分析",
    seconds: "秒",
    bestFor: "适合",
    benchmark: "指标",
    // 营销指南 tab
    guidesTitle: "内容营销指南",
    guidesDesc: "手把手教你 TikTok 广告投放、Dropshipping 选品、UGC 脚本写作和 Shopify 引流。",
    readArticle: "阅读文章",
    minRead: "分钟",
    guidesCta: "想应用这些技巧？",
    guidesCtaDesc: "使用 ShopPilot 生成基于你所学内容的广告包。",
  },
} as const;

type PageCopy = (typeof pageI18n)["en"];

export default function KnowledgePage() {
  const { locale } = useI18n();
  const { data: session } = useSession();
  const t = pageI18n[locale];
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [targetMarket, setTargetMarket] = useState<TargetMarketCode>(DEFAULT_TARGET_MARKET);
  const [loadingMarket, setLoadingMarket] = useState<TargetMarketCode | null>(DEFAULT_TARGET_MARKET);
  const [activeTab, setActiveTab] = useState<TabType>("patterns");

  useEffect(() => {
    let isCurrent = true;
    apiFetch<{ entries: KnowledgeEntry[] }>(`/api/inspiration/knowledge?targetMarket=${targetMarket}`).then((response) => {
      if (!isCurrent) return;
      if (response.data) setEntries(response.data.entries);
      setLoadingMarket(null);
    });
    return () => {
      isCurrent = false;
    };
  }, [targetMarket]);

  const loading = loadingMarket === targetMarket;

  const stats = useMemo(() => {
    const videoCount = entries.reduce((sum, entry) => sum + (entry.video_count || 0), 0);
    const hookCount = entries.reduce((sum, entry) => sum + entry.hook_patterns.length, 0);
    const avgDuration = entries.length
      ? Math.round(entries.reduce((sum, entry) => sum + (entry.avg_duration || 0), 0) / entries.length)
      : 0;
    return { videoCount, hookCount, avgDuration };
  }, [entries]);

  const spotlight = entries[0];

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      <Navbar isSignedIn={!!session?.user} user={session?.user} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3.5 py-1.5 text-xs text-emerald-100/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse-glow" />
            {t.badge}
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/52">{t.desc}</p>
        </section>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          <button
            onClick={() => setActiveTab("patterns")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "patterns"
                ? "bg-white/[0.12] text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            <span className="mr-2">🎯</span>
            {t.tabPatterns}
          </button>
          <button
            onClick={() => setActiveTab("guides")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "guides"
                ? "bg-white/[0.12] text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            <span className="mr-2">📚</span>
            {t.tabGuides}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "patterns" ? (
          <PatternsTab
            entries={entries}
            spotlight={spotlight}
            stats={stats}
            loading={loading}
            targetMarket={targetMarket}
            setTargetMarket={setTargetMarket}
            setLoadingMarket={setLoadingMarket}
            t={t as PageCopy}
          />
        ) : (
          <GuidesTab t={t as PageCopy} locale={locale} />
        )}
      </main>
    </div>
  );
}

function PatternsTab({
  entries,
  spotlight,
  stats,
  loading,
  targetMarket,
  setTargetMarket,
  setLoadingMarket,
  t,
}: {
  entries: KnowledgeEntry[];
  spotlight: KnowledgeEntry | undefined;
  stats: { videoCount: number; hookCount: number; avgDuration: number };
  loading: boolean;
  targetMarket: TargetMarketCode;
  setTargetMarket: (value: TargetMarketCode) => void;
  setLoadingMarket: (value: TargetMarketCode | null) => void;
  t: PageCopy;
}) {
  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <div className="flex flex-wrap gap-3">
            <Link href="/storyboard" className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90">
              {t.generate}
            </Link>
            <Link href="/inspiration" className="inline-flex h-11 items-center rounded-xl border border-white/[0.1] px-5 text-sm font-semibold text-white/62 transition hover:bg-white/[0.05] hover:text-white">
              {t.viewResearch}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <TargetMarketSelect
            value={targetMarket}
            onChange={(value) => {
              setTargetMarket(value);
              setLoadingMarket(value);
            }}
            label={t.market}
            hint={t.marketHint}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <MetricCard label={t.categories} value={String(entries.length)} tone="emerald" />
        <MetricCard label={t.videos} value={String(stats.videoCount)} tone="blue" />
        <MetricCard label={t.hooks} value={String(stats.hookCount)} tone="violet" />
        <MetricCard label={t.avgDuration} value={`${stats.avgDuration}${t.seconds}`} tone="orange" />
      </section>

      {loading ? (
        <div className="py-20 text-center text-sm text-white/30">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="space-y-4 py-20 text-center">
          <div className="text-sm text-white/35">{t.noData}</div>
          <Link href="/inspiration" className="inline-flex items-center rounded-xl border border-white/[0.1] px-4 py-2 text-xs text-white/55 transition-all hover:bg-white/[0.05] hover:text-white">
            {t.viewResearch}
          </Link>
        </div>
      ) : (
        <>
          {spotlight && <Spotlight entry={spotlight} t={t} />}

          <section className="mt-8 grid gap-5">
            {entries.map((entry, index) => (
              <CategoryCard key={entry.id} entry={entry} t={t} index={index} />
            ))}
          </section>
        </>
      )}
    </>
  );
}

function GuidesTab({ t, locale }: { t: PageCopy; locale: "en" | "zh" }) {
  return (
    <>
      <section className="mb-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t.guidesTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/48">{t.guidesDesc}</p>
        </div>
        <div className="rounded-2xl border border-blue-300/15 bg-blue-300/[0.04] p-5 text-center">
          <p className="text-sm text-blue-100/70">{t.guidesCta}</p>
          <Link href="/storyboard" className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-blue-400/20 px-5 text-sm font-medium text-blue-100 transition hover:bg-blue-400/30">
            {t.generate}
          </Link>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-blue-300/10 bg-blue-300/[0.025] p-5 transition-all duration-300 hover:border-blue-300/25 hover:bg-blue-300/[0.06] hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full border border-blue-300/20 bg-blue-300/[0.08] px-2.5 py-1 text-[11px] text-blue-100/70">
                {post.category}
              </span>
              <span className="text-[11px] text-white/30">
                {post.readTime} {t.minRead}
              </span>
            </div>
            <h3 className="mb-2 text-base font-semibold text-white group-hover:text-blue-100 transition-colors">
              {post.title[locale]}
            </h3>
            <p className="text-sm leading-6 text-white/45 line-clamp-3">
              {post.excerpt[locale]}
            </p>
            <div className="mt-4 text-xs font-medium text-blue-100/50 group-hover:text-blue-100/80 transition-colors">
              {t.readArticle} →
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: "emerald" | "blue" | "violet" | "orange" }) {
  const toneClass = {
    emerald: "from-emerald-400/28 to-emerald-400/[0.03] text-emerald-100",
    blue: "from-blue-400/28 to-blue-400/[0.03] text-blue-100",
    violet: "from-violet-400/28 to-violet-400/[0.03] text-violet-100",
    orange: "from-orange-400/28 to-orange-400/[0.03] text-orange-100",
  }[tone];

  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-gradient-to-br ${toneClass} p-5`}>
      <div className="text-xs text-white/42">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function Spotlight({ entry, t }: { entry: KnowledgeEntry; t: PageCopy }) {
  const topHook = entry.hook_patterns[0];
  const topStructure = entry.structure_templates[0];

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.045]">
      <div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-6">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-emerald-100/65">{t.spotlight}</div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">{entry.category}</h2>
          <p className="mt-3 text-sm leading-7 text-emerald-50/70">{entry.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-white/55">
              {entry.video_count} {t.videosAnalyzed}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-white/55">
              {t.avgDuration}: {entry.avg_duration}{t.seconds}
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {topHook && (
            <div className="rounded-xl border border-white/[0.08] bg-[#050508]/50 p-4">
              <div className="text-xs font-semibold text-emerald-200">{t.hookPatterns}</div>
              <div className="mt-3 text-sm font-semibold text-white">{topHook.pattern}</div>
              <p className="mt-2 text-sm leading-6 text-white/60">&ldquo;{topHook.example}&rdquo;</p>
              <div className="mt-3 text-xs text-white/35">{t.benchmark}: {topHook.avg_engagement}</div>
            </div>
          )}
          {topStructure && (
            <div className="rounded-xl border border-white/[0.08] bg-[#050508]/50 p-4">
              <div className="text-xs font-semibold text-blue-200">{t.structures}</div>
              <div className="mt-3 text-sm font-semibold text-white">{topStructure.name}</div>
              <div className="mt-3 space-y-2">
                {topStructure.scenes.slice(0, 3).map((scene) => (
                  <div key={`${topStructure.name}-${scene.time}`} className="grid grid-cols-[44px_1fr] gap-2 text-xs">
                    <span className="font-mono text-blue-200/60">{scene.time}</span>
                    <span className="leading-5 text-white/58">{scene.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ entry, t, index }: { entry: KnowledgeEntry; t: PageCopy; index: number }) {
  const topHooks = entry.hook_patterns.slice(0, 3);
  const topStructures = entry.structure_templates.slice(0, 2);

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.15] hover:bg-white/[0.04]">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">Pattern {String(index + 1).padStart(2, "0")}</div>
          <h2 className="mt-2 text-xl font-bold text-white/92">{entry.category}</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/40">
            <span>{entry.video_count} {t.videosAnalyzed}</span>
            <span>/</span>
            <span>{t.avgDuration}: {entry.avg_duration}{t.seconds}</span>
          </div>
          {entry.summary && <p className="mt-4 text-sm leading-7 text-white/48">{entry.summary}</p>}
          <PillList title={t.tones} items={entry.tone_profiles.slice(0, 4)} />
        </div>

        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            {topHooks.map((hook, hookIndex) => (
              <div key={`${hook.pattern}-${hookIndex}`} className="rounded-xl border border-white/[0.07] bg-[#07070c] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-emerald-300">{hook.pattern}</div>
                  <div className="rounded-full bg-emerald-300/10 px-2 py-0.5 text-[10px] text-emerald-100/65">{hook.frequency}x</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">&ldquo;{hook.example}&rdquo;</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {topStructures.map((template, templateIndex) => (
              <div key={`${template.name}-${templateIndex}`} className="rounded-xl border border-blue-300/10 bg-blue-300/[0.035] p-4">
                <div className="text-sm font-semibold text-blue-100">{template.name}</div>
                {template.best_for && <div className="mt-1 text-[11px] text-blue-100/45">{t.bestFor}: {template.best_for}</div>}
                <div className="mt-3 space-y-2">
                  {template.scenes.slice(0, 4).map((scene, sceneIndex) => (
                    <div key={`${template.name}-${scene.time}-${sceneIndex}`} className="grid grid-cols-[48px_1fr] gap-2 text-xs">
                      <span className="font-mono text-blue-100/45">{scene.time}</span>
                      <span className="leading-5 text-white/58">{scene.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PillList title={t.ctas} items={entry.cta_templates.slice(0, 5)} compact />
            <PillList title={t.hashtags} items={entry.top_hashtags.slice(0, 8).map((tag) => `#${tag}`)} compact />
          </div>
        </div>
      </div>
    </article>
  );
}

function PillList({ title, items, compact = false }: { title: string; items: string[]; compact?: boolean }) {
  if (!items.length) return null;

  return (
    <div className={compact ? "" : "mt-5"}>
      <h3 className="mb-3 text-sm font-semibold text-white/82">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={`${title}-${index}-${item}`} className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[11px] text-white/55">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
