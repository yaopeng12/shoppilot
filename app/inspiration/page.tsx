"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { FilterBar } from "@/components/inspiration/filter-bar";
import { InspirationStatsSection } from "@/components/inspiration/inspiration-stats";
import { InspirationGrid } from "@/components/inspiration/inspiration-grid";
import { VideoDetailModal } from "@/components/inspiration/video-detail-modal";
import { TargetMarketSelect } from "@/components/localization/target-market-select";
import { useI18n } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { DEFAULT_TARGET_MARKET, type TargetMarketCode } from "@/lib/localization/markets";
import type { InspirationFilters, InspirationStats, TrendingVideo, VideoAnalysis } from "@/lib/inspiration/types";

type VideoWithAnalysis = TrendingVideo & { video_analyses?: VideoAnalysis | VideoAnalysis[] };

const pageI18n = {
  en: {
    badge: "Pet cleaning video research",
    title: "Pet Cleaning Template Library",
    desc: "A working library of public short-video ad structures for litter tracking, litter-box smell, cleaning time, multi-pet mess, fur removal, and fabric odor. Reuse the structure, never the creator's content.",
    loadMore: "Load more",
    loading: "Loading...",
    cta: "Turn a proven structure into your own Pet Cleaning Ad Pack",
    ctaDesc: "Use these signals for source matching, script variants, storyboard shots, offer angles, and claim-safe creative.",
    ctaBtn: "Generate Ad Pack",
    analyzeTitle: "Analyze a public video",
    analyzeDesc: "Paste a public video URL to extract hooks, structure, proof moments, and CTA patterns.",
    analyzePlaceholder: "Paste TikTok video URL...",
    analyzeBtn: "Analyze",
    analyzing: "Analyzing...",
    market: "Template market",
    marketHint: "Shows hooks, CTA, and structure notes in the selected market voice.",
  },
  zh: {
    badge: "宠物清洁视频研究",
    title: "宠物清洁模板库",
    desc: "沉淀猫砂带出、猫砂盆异味、清理耗时、多宠家庭脏乱、宠物毛发、织物异味等方向的公开视频广告结构。我们复用结构和转化逻辑，不复制创作者素材。",
    loadMore: "加载更多",
    loading: "加载中...",
    cta: "把高潜力结构变成你的 Pet Cleaning Ad Pack",
    ctaDesc: "用于货源匹配、脚本变体、分镜、卖点角度和合规表达，直接进入一体化生成流程。",
    ctaBtn: "生成广告包",
    analyzeTitle: "分析公开视频",
    analyzeDesc: "粘贴公开视频 URL，提取 Hook、结构、证明镜头和 CTA 模式。",
    analyzePlaceholder: "粘贴 TikTok 视频 URL...",
    analyzeBtn: "分析",
    analyzing: "分析中...",
    market: "模板市场",
    marketHint: "按目标市场展示 Hook、CTA 和结构说明，不做直译。",
  },
} as const;

export default function InspirationPage() {
  const { locale } = useI18n();
  const { data: session } = useSession();
  const t = pageI18n[locale];

  const [filters, setFilters] = useState<InspirationFilters>({ sort: "views", page: 1, pageSize: 20 });
  const [targetMarket, setTargetMarket] = useState<TargetMarketCode>(DEFAULT_TARGET_MARKET);
  const [videos, setVideos] = useState<VideoWithAnalysis[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<InspirationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VideoWithAnalysis | null>(null);
  const [analyzeUrl, setAnalyzeUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const fetchVideos = useCallback(async (nextFilters: InspirationFilters, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextFilters.category) params.set("category", nextFilters.category);
      if (nextFilters.period) params.set("period", nextFilters.period);
      if (nextFilters.sort) params.set("sort", nextFilters.sort);
      if (nextFilters.search) params.set("search", nextFilters.search);
      params.set("targetMarket", targetMarket);
      params.set("page", String(nextFilters.page || 1));
      params.set("pageSize", String(nextFilters.pageSize || 20));

      const response = await apiFetch<{ videos: VideoWithAnalysis[]; total: number }>(`/api/inspiration/videos?${params}`);
      if (response.data) {
        setVideos((prev) => (append ? [...prev, ...response.data.videos] : response.data.videos));
        setTotal(response.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [targetMarket]);

  const fetchStats = useCallback(async () => {
    const response = await apiFetch<InspirationStats>("/api/inspiration/stats");
    if (response.data) setStats(response.data);
  }, []);

  useEffect(() => {
    void fetchVideos(filters);
    void fetchStats();
  }, [fetchVideos, fetchStats, filters.category, filters.period, filters.sort, filters.search, targetMarket]);

  async function handleAnalyze() {
    if (!analyzeUrl.trim()) return;
    setAnalyzing(true);
    try {
      const response = await apiFetch<{ video: TrendingVideo; analysis: VideoAnalysis }>("/api/inspiration/analyze-url", {
        method: "POST",
        body: JSON.stringify({ videoUrl: analyzeUrl.trim(), category: "pet_cleaning" }),
      });
      if (response.data) {
        setSelected({
          ...response.data.video,
          video_analyses: [response.data.analysis],
        });
      }
    } finally {
      setAnalyzing(false);
    }
  }

  function handleLoadMore() {
    const next = { ...filters, page: (filters.page || 1) + 1 };
    setFilters(next);
    void fetchVideos(next, true);
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      <Navbar isSignedIn={!!session?.user} user={session?.user} />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-20 pt-12 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/50">
            {t.badge}
          </div>
          <h1 className="bg-gradient-to-b from-white to-white/62 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {t.title}
          </h1>
          <p className="text-sm leading-7 text-white/48">{t.desc}</p>
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-3">
          <div className="space-y-1 text-center">
            <h2 className="text-sm font-semibold text-white/72">{t.analyzeTitle}</h2>
            <p className="text-xs text-white/35">{t.analyzeDesc}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={analyzeUrl}
              onChange={(event) => setAnalyzeUrl(event.target.value)}
              placeholder={t.analyzePlaceholder}
              className="min-h-11 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/25 transition-colors focus:border-emerald-500/50 focus:outline-none"
              onKeyDown={(event) => event.key === "Enter" && void handleAnalyze()}
            />
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !analyzeUrl.trim()}
              className="min-h-11 whitespace-nowrap rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:from-emerald-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? t.analyzing : t.analyzeBtn}
            </button>
          </div>
        </div>

        {stats && <InspirationStatsSection stats={stats} />}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            <TargetMarketSelect
              compact
              value={targetMarket}
              onChange={(value) => {
                setTargetMarket(value);
                setFilters((current) => ({ ...current, page: 1 }));
              }}
              label={t.market}
              hint={t.marketHint}
            />
            <div className="lg:pt-[21px]">
              <FilterBar filters={filters} onChange={setFilters} />
            </div>
          </div>
        </div>
        <InspirationGrid videos={videos} onSelect={setSelected} />

        {videos.length < total && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="rounded-lg border border-white/[0.1] px-6 py-2.5 text-sm text-white/50 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
            >
              {loading ? t.loading : t.loadMore}
            </button>
          </div>
        )}

        <div className="space-y-4 pt-10 text-center">
          <div className="text-lg font-semibold text-white/82">{t.cta}</div>
          <p className="text-sm text-white/42">{t.ctaDesc}</p>
          <Link
            href="/storyboard"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:from-emerald-400 hover:to-blue-500"
          >
            {t.ctaBtn}
          </Link>
        </div>
      </main>

      <VideoDetailModal video={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
