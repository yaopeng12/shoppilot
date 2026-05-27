"use client";

import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import type { TrendingVideo, VideoAnalysis } from "@/lib/inspiration/types";
import { getUiProductCategoryLabel } from "@/lib/localization/markets";

type VideoWithAnalysis = TrendingVideo & { video_analyses?: VideoAnalysis | VideoAnalysis[] };

const i18n = {
  en: {
    likes: "likes",
    comments: "comments",
    shares: "shares",
    score: "score",
    viewAnalysis: "View Template",
    empty: "No template candidates yet. Run the daily pet-cleaning research job or add seed videos first.",
  },
  zh: {
    likes: "点赞",
    comments: "评论",
    shares: "分享",
    score: "评分",
    viewAnalysis: "查看模板",
    empty: "暂无模板候选数据。可以先运行每日宠物清洁研究任务，或补充种子视频。",
  },
} as const;

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getAnalysis(video: VideoWithAnalysis) {
  return Array.isArray(video.video_analyses) ? video.video_analyses[0] : video.video_analyses;
}

function VideoCard({ video, onClick }: { video: VideoWithAnalysis; onClick: () => void }) {
  const { locale } = useI18n();
  const t = i18n[locale];
  const analysis = getAnalysis(video);
  const hook = analysis?.hooks?.find(Boolean);
  const categoryLabel = getUiProductCategoryLabel(video.product_category, locale);

  return (
    <button
      type="button"
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] text-left",
        "transition-all duration-300 hover:border-emerald-400/30 hover:bg-white/[0.045]",
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[9/12] overflow-hidden bg-[#10131a]">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title || ""}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-between p-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-white/35">
              <span>{categoryLabel}</span>
              {analysis?.engagement_score != null && (
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-200">
                  {t.score} {analysis.engagement_score}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="text-lg font-semibold leading-tight text-white/88">
                {categoryLabel}
              </div>
              {hook && <div className="line-clamp-4 text-sm leading-6 text-white/55">{hook}</div>}
            </div>
            <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20">
            {t.viewAnalysis}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <div className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white/88">
            {video.title || "Untitled template candidate"}
          </div>
          <div className="text-xs text-white/35">@{video.author_name || "unknown"}</div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/42">
          <span>{formatNum(video.like_count)} {t.likes}</span>
          <span>{formatNum(video.comment_count)} {t.comments}</span>
          <span>{formatNum(video.share_count)} {t.shares}</span>
        </div>

        {hook && (
          <div className="mt-auto line-clamp-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 text-[11px] leading-5 text-emerald-100/70">
            {hook}
          </div>
        )}
      </div>
    </button>
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
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-6 py-14 text-center text-sm text-white/38">
        {t.empty}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onClick={() => onSelect(video)} />
      ))}
    </div>
  );
}
