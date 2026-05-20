"use client";

import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import type { TrendingVideo, VideoAnalysis } from "@/lib/inspiration/types";

type VideoWithAnalysis = TrendingVideo & { video_analyses?: VideoAnalysis | VideoAnalysis[] };

const i18n = {
  en: { views: "views", likes: "likes", comments: "comments", viewAnalysis: "View Analysis" },
  zh: { views: "播放", likes: "点赞", comments: "评论", viewAnalysis: "查看分析" },
} as const;

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function VideoCard({
  video,
  onClick,
}: {
  video: VideoWithAnalysis;
  onClick: () => void;
}) {
  const { locale } = useI18n();
  const t = i18n[locale];
  const analysis = Array.isArray(video.video_analyses) ? video.video_analyses[0] : video.video_analyses;

  return (
    <div
      className={cn(
        "group rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden",
        "hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-300 cursor-pointer",
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/14] bg-white/[0.03] overflow-hidden">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title || ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <svg width="48" height="48" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1"/><polygon points="6.5,6 6.5,10 10.5,8" fill="currentColor"/></svg>
          </div>
        )}
        {/* Category badge */}
        {video.product_category && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[10px] text-white/80 font-medium">
            {video.product_category}
          </div>
        )}
        {/* Duration badge */}
        {video.duration_seconds && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-white/70">
            {video.duration_seconds}s
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold">
            {t.viewAnalysis}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="text-sm font-medium text-white/90 line-clamp-2 min-h-[2.5rem]">
          {video.title || "Untitled"}
        </div>
        <div className="text-[11px] text-white/35">
          @{video.author_name || "unknown"}
        </div>
        {/* Engagement metrics */}
        <div className="flex items-center gap-3 text-[11px] text-white/40">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3C4 3 1 6.5 1 8.5S4 14 8 14s7-3.5 7-5.5S12 3 8 3z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
            {formatNum(video.view_count)}
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 018 4a3.5 3.5 0 015.5 3c0 3.5-5.5 7-5.5 7z" stroke="currentColor" strokeWidth="1.2"/></svg>
            {formatNum(video.like_count)}
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 3h12v8H4l-2 2V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            {formatNum(video.comment_count)}
          </span>
        </div>
        {/* Hook preview */}
        {analysis?.hooks?.[0] && (
          <div className="text-[11px] text-violet-300/60 italic line-clamp-1">
            &ldquo;{analysis.hooks[0]}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}

export function InspirationGrid({
  videos,
  onSelect,
}: {
  videos: VideoWithAnalysis[];
  onSelect: (video: VideoWithAnalysis) => void;
}) {
  const { locale } = useI18n();
  const t = i18n[locale];

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 text-white/30 text-sm">
        {locale === "zh" ? "暂无视频数据，请稍后再试" : "No videos yet. Check back later."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} onClick={() => onSelect(v)} />
      ))}
    </div>
  );
}
