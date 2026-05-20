"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { FilterBar } from "@/components/inspiration/filter-bar";
import { InspirationStatsSection } from "@/components/inspiration/inspiration-stats";
import { InspirationGrid } from "@/components/inspiration/inspiration-grid";
import { VideoDetailModal } from "@/components/inspiration/video-detail-modal";
import { useI18n } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import type { TrendingVideo, VideoAnalysis, InspirationFilters, InspirationStats } from "@/lib/inspiration/types";

type VideoWithAnalysis = TrendingVideo & { video_analyses?: VideoAnalysis | VideoAnalysis[] };

const pageI18n = {
  en: {
    badge: "TikTok Trending Insights",
    title: "Trending Video Inspiration",
    desc: "Discover what's working on TikTok right now. AI-analyzed hooks, structures, and CTAs from top-performing product videos.",
    loadMore: "Load More",
    loading: "Loading...",
    cta: "Ready to create your own viral ad?",
    ctaDesc: "Use these insights to generate high-converting TikTok ad content for your products.",
    ctaBtn: "Generate Ad Content",
    analyzeTitle: "Analyze a Video",
    analyzeDesc: "Paste a TikTok video URL to get instant AI analysis of its hooks, structure, and CTA patterns.",
    analyzePlaceholder: "Paste TikTok video URL...",
    analyzeBtn: "Analyze",
    analyzing: "Analyzing...",
  },
  zh: {
    badge: "TikTok 热门趋势洞察",
    title: "热门视频灵感库",
    desc: "发现 TikTok 上最火的带货视频。AI 分析提取 Hook、视频结构、CTA 和风格调性。",
    loadMore: "加载更多",
    loading: "加载中...",
    cta: "准备好创建你自己的爆款广告了吗？",
    ctaDesc: "利用这些洞察，为你的产品生成高转化的 TikTok 广告内容。",
    ctaBtn: "生成广告内容",
    analyzeTitle: "分析视频",
    analyzeDesc: "粘贴 TikTok 视频链接，AI 即时分析其 Hook、结构和 CTA 模式。",
    analyzePlaceholder: "粘贴 TikTok 视频链接...",
    analyzeBtn: "分析",
    analyzing: "分析中...",
  },
} as const;

export default function InspirationPage() {
  const { locale } = useI18n();
  const { isSignedIn } = useUser();
  const t = pageI18n[locale];

  const [filters, setFilters] = useState<InspirationFilters>({ sort: "views", page: 1, pageSize: 20 });
  const [videos, setVideos] = useState<VideoWithAnalysis[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<InspirationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VideoWithAnalysis | null>(null);

  const [analyzeUrl, setAnalyzeUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<VideoWithAnalysis | null>(null);

  const fetchVideos = useCallback(async (f: InspirationFilters, append = false) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.category) params.set("category", f.category);
    if (f.period) params.set("period", f.period);
    if (f.sort) params.set("sort", f.sort);
    if (f.search) params.set("search", f.search);
    params.set("page", String(f.page || 1));
    params.set("pageSize", String(f.pageSize || 20));

    const { data } = await apiFetch<{ videos: VideoWithAnalysis[]; total: number }>(
      `/api/inspiration/videos?${params}`,
    );
    if (data) {
      setVideos((prev) => (append ? [...prev, ...data.videos] : data.videos));
      setTotal(data.total);
    }
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const { data } = await apiFetch<InspirationStats>("/api/inspiration/stats");
    if (data) setStats(data);
  }, []);

  useEffect(() => {
    fetchVideos(filters);
    fetchStats();
  }, [fetchVideos, fetchStats, filters.category, filters.period, filters.sort, filters.search]);

  const handleLoadMore = () => {
    const next = { ...filters, page: (filters.page || 1) + 1 };
    setFilters(next);
    fetchVideos(next, true);
  };

  async function handleAnalyze() {
    if (!analyzeUrl.trim()) return;
    setAnalyzing(true);
    setAnalyzeResult(null);
    try {
      const { data } = await apiFetch<{ video: TrendingVideo; analysis: VideoAnalysis }>(
        "/api/inspiration/analyze-url",
        { method: "POST", body: JSON.stringify({ videoUrl: analyzeUrl.trim() }) },
      );
      if (data) {
        const videoWithAnalysis: VideoWithAnalysis = {
          ...data.video,
          video_analyses: [data.analysis],
        };
        setAnalyzeResult(videoWithAnalysis);
        setSelected(videoWithAnalysis);
      }
    } catch {
      // silent
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-white relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        <Navbar isSignedIn={!!isSignedIn} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-8">
          {/* Page header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-white/50 font-medium tracking-wide uppercase">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.8 3.6L14 6.2l-3 2.9.7 4.1L8 11.4 4.3 13.2l.7-4.1-3-2.9 4.2-.6L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              {t.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-sm text-white/40 leading-relaxed">{t.desc}</p>
          </div>

          {/* Analyze a video */}
          <div className="max-w-2xl mx-auto w-full space-y-3">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-semibold text-white/70">{t.analyzeTitle}</h2>
              <p className="text-xs text-white/35">{t.analyzeDesc}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={analyzeUrl}
                onChange={(e) => setAnalyzeUrl(e.target.value)}
                placeholder={t.analyzePlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !analyzeUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {analyzing ? t.analyzing : t.analyzeBtn}
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && <InspirationStatsSection stats={stats} />}

          {/* Filters */}
          <FilterBar filters={filters} onChange={setFilters} />

          {/* Grid */}
          <InspirationGrid videos={videos} onSelect={setSelected} />

          {/* Load more */}
          {videos.length < total && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl border border-white/[0.1] text-sm text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? t.loading : t.loadMore}
              </button>
            </div>
          )}

          {/* CTA section */}
          <div className="text-center pt-12 space-y-4">
            <div className="text-lg font-semibold text-white/80">{t.cta}</div>
            <p className="text-sm text-white/40">{t.ctaDesc}</p>
            <Link
              href="/tiktok-adgen"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-blue-500 transition-all duration-200"
            >
              {t.ctaBtn}
            </Link>
          </div>
        </main>
      </div>

      {/* Detail modal */}
      <VideoDetailModal video={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
