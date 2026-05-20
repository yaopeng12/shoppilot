"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import type { TrendingVideo, VideoAnalysis } from "@/lib/inspiration/types";

type VideoWithAnalysis = TrendingVideo & { video_analyses?: VideoAnalysis | VideoAnalysis[] };

const i18n = {
  en: {
    hooks: "Hooks",
    structure: "Structure",
    cta: "CTA Patterns",
    insights: "Insights",
    tone: "Tone & Style",
    takeaways: "Key Takeaways",
    copy: "Copy",
    copied: "Copied",
    engagement: "Engagement",
    views: "Views",
    likes: "Likes",
    comments: "Comments",
    shares: "Shares",
    playOnTikTok: "Watch on TikTok",
    favorite: "Save",
    favorited: "Saved",
    generateSimilar: "Generate Similar Script",
  },
  zh: {
    hooks: "Hook 开头",
    structure: "视频结构",
    cta: "CTA 模式",
    insights: "洞察",
    tone: "风格调性",
    takeaways: "关键启示",
    copy: "复制",
    copied: "已复制",
    engagement: "互动率",
    views: "播放",
    likes: "点赞",
    comments: "评论",
    shares: "分享",
    playOnTikTok: "在 TikTok 观看",
    favorite: "收藏",
    favorited: "已收藏",
    generateSimilar: "生成同款脚本",
  },
} as const;

const tabs = ["hooks", "structure", "cta", "insights"] as const;

function CopyBtn({ text }: { text: string }) {
  const { locale } = useI18n();
  const t = i18n[locale];
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "h-6 px-2 rounded-md text-[10px] font-medium transition-all duration-200 border",
        copied
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "border-white/[0.1] text-white/40 hover:text-white hover:bg-white/[0.05]",
      )}
    >
      {copied ? t.copied : t.copy}
    </button>
  );
}

export function VideoDetailModal({
  video,
  open,
  onClose,
}: {
  video: VideoWithAnalysis | null;
  open: boolean;
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const t = i18n[locale];
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("hooks");
  const [isFav, setIsFav] = useState(false);

  if (!video) return null;
  const analysis = Array.isArray(video.video_analyses) ? video.video_analyses[0] : video.video_analyses;

  async function handleFavorite() {
    const { data } = await apiFetch<{ favorited: boolean }>("/api/inspiration/favorites", {
      method: "POST",
      body: JSON.stringify({ videoId: video?.id }),
    });
    if (data) setIsFav(data.favorited);
  }

  return (
    <Modal open={open} title="" onClose={onClose} className="max-w-3xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex gap-4">
          {video.thumbnail_url && (
            <img
              src={video.thumbnail_url}
              alt=""
              className="w-28 aspect-[9/14] rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-base font-semibold text-white/90 line-clamp-2">
              {video.title || "Untitled"}
            </div>
            <div className="text-xs text-white/35">@{video.author_name || "unknown"}</div>
            <div className="flex flex-wrap gap-3 text-xs text-white/50">
              <span>{(video.view_count ?? 0).toLocaleString()} {t.views}</span>
              <span>{(video.like_count ?? 0).toLocaleString()} {t.likes}</span>
              <span>{(video.comment_count ?? 0).toLocaleString()} {t.comments}</span>
              <span>{(video.share_count ?? 0).toLocaleString()} {t.shares}</span>
            </div>
            {analysis?.engagement_score != null && (
              <div className="text-xs">
                <span className="text-white/35">{t.engagement}: </span>
                <span className="text-violet-300 font-semibold">{analysis.engagement_score}%</span>
              </div>
            )}
            <div className="flex gap-2 pt-1 flex-wrap">
              <Link
                href={`/tiktok-adgen?refVideoId=${video.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white text-[11px] font-medium hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-500/20"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                {t.generateSimilar}
              </Link>
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[11px] font-medium hover:from-violet-500 hover:to-pink-500 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><polygon points="5,3 5,13 13,8" fill="currentColor"/></svg>
                {t.playOnTikTok}
              </a>
              <button
                type="button"
                onClick={handleFavorite}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border",
                  isFav
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                    : "border-white/[0.1] text-white/40 hover:text-white hover:bg-white/[0.05]",
                )}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill={isFav ? "currentColor" : "none"}><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 018 4a3.5 3.5 0 015.5 3c0 3.5-5.5 7-5.5 7z" stroke="currentColor" strokeWidth="1.2"/></svg>
                {isFav ? t.favorited : t.favorite}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/[0.08]">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-xs font-medium transition-all duration-200 border-b-2 -mb-px",
                activeTab === tab
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-white/35 hover:text-white/60",
              )}
            >
              {t[tab]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[200px]">
          {!analysis ? (
            <div className="text-center py-8 text-white/30 text-sm">
              {locale === "zh" ? "暂无分析数据" : "No analysis available"}
            </div>
          ) : activeTab === "hooks" ? (
            <div className="space-y-2">
              {analysis.hooks.map((hook, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 group"
                >
                  <span className="w-5 h-5 rounded-full bg-violet-600/15 text-violet-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 text-sm text-white/80">&ldquo;{hook}&rdquo;</div>
                  <CopyBtn text={hook} />
                </div>
              ))}
            </div>
          ) : activeTab === "structure" ? (
            <div className="space-y-2">
              {analysis.video_structure.map((scene, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <span className="text-[11px] text-violet-300 font-mono w-14 flex-shrink-0 mt-0.5">
                    {scene.time}
                  </span>
                  <div className="flex-1 text-sm text-white/80">{scene.description}</div>
                </div>
              ))}
            </div>
          ) : activeTab === "cta" ? (
            <div className="space-y-2">
              {analysis.cta_patterns.map((cta, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600/15 text-emerald-400 text-[10px] flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 text-sm text-white/80">{cta}</div>
                  <CopyBtn text={cta} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.tone_style && (
                <div>
                  <div className="text-xs text-white/35 mb-2">{t.tone}</div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-white/80">
                    {analysis.tone_style}
                  </div>
                </div>
              )}
              {analysis.key_takeaways.length > 0 && (
                <div>
                  <div className="text-xs text-white/35 mb-2">{t.takeaways}</div>
                  <div className="space-y-2">
                    {analysis.key_takeaways.map((tk, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                      >
                        <span className="text-emerald-400 mt-0.5">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                        <div className="text-sm text-white/80">{tk}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
