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
    engagement: "Candidate score",
    likes: "Likes",
    comments: "Comments",
    shares: "Shares",
    openSource: "Open source",
    favorite: "Save",
    favorited: "Saved",
    generateSimilar: "Generate Ad Pack",
    noAnalysis: "No analysis available",
  },
  zh: {
    hooks: "Hook 开头",
    structure: "视频结构",
    cta: "CTA 模式",
    insights: "洞察",
    tone: "语气风格",
    takeaways: "关键启发",
    copy: "复制",
    copied: "已复制",
    engagement: "候选评分",
    likes: "点赞",
    comments: "评论",
    shares: "分享",
    openSource: "打开来源",
    favorite: "保存",
    favorited: "已保存",
    generateSimilar: "生成广告包",
    noAnalysis: "暂无分析数据",
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
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "h-7 rounded-md border px-2 text-[10px] font-medium transition-all duration-200",
        copied
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-white/[0.1] text-white/42 hover:bg-white/[0.05] hover:text-white",
      )}
    >
      {copied ? t.copied : t.copy}
    </button>
  );
}

function getAnalysis(video: VideoWithAnalysis) {
  return Array.isArray(video.video_analyses) ? video.video_analyses[0] : video.video_analyses;
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
  const analysis = getAnalysis(video);

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
        <div className="flex flex-col gap-4 sm:flex-row">
          {video.thumbnail_url && (
            <img src={video.thumbnail_url} alt="" className="w-28 flex-shrink-0 rounded-xl object-cover sm:aspect-[9/14]" />
          )}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="line-clamp-2 text-base font-semibold text-white/90">
              {video.title || "Untitled template candidate"}
            </div>
            <div className="text-xs text-white/35">@{video.author_name || "unknown"}</div>
            <div className="flex flex-wrap gap-3 text-xs text-white/50">
              <span>{(video.like_count ?? 0).toLocaleString()} {t.likes}</span>
              <span>{(video.comment_count ?? 0).toLocaleString()} {t.comments}</span>
              <span>{(video.share_count ?? 0).toLocaleString()} {t.shares}</span>
            </div>
            {analysis?.engagement_score != null && (
              <div className="text-xs">
                <span className="text-white/35">{t.engagement}: </span>
                <span className="font-semibold text-emerald-300">{analysis.engagement_score}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/storyboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-blue-500"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>
                {t.generateSimilar}
              </Link>
              {video.video_url && (
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1.5 text-[11px] font-medium text-white/55 transition-all hover:bg-white/[0.05] hover:text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3.5 11 8l-5 4.5v-9Z" fill="currentColor" /></svg>
                  {t.openSource}
                </a>
              )}
              <button
                type="button"
                onClick={handleFavorite}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all",
                  isFav
                    ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                    : "border-white/[0.1] text-white/42 hover:bg-white/[0.05] hover:text-white",
                )}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill={isFav ? "currentColor" : "none"}><path d="M8 14S2.5 10.5 2.5 7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7Z" stroke="currentColor" strokeWidth="1.2" /></svg>
                {isFav ? t.favorited : t.favorite}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-white/[0.08]">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-xs font-medium transition-all duration-200",
                activeTab === tab
                  ? "border-emerald-400 text-emerald-200"
                  : "border-transparent text-white/35 hover:text-white/65",
              )}
            >
              {t[tab]}
            </button>
          ))}
        </div>

        <div className="min-h-[200px]">
          {!analysis ? (
            <div className="py-8 text-center text-sm text-white/30">{t.noAnalysis}</div>
          ) : activeTab === "hooks" ? (
            <div className="space-y-2">
              {analysis.hooks.map((hook, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-[10px] text-emerald-300">
                    {index + 1}
                  </span>
                  <div className="flex-1 text-sm text-white/80">{hook}</div>
                  <CopyBtn text={hook} />
                </div>
              ))}
            </div>
          ) : activeTab === "structure" ? (
            <div className="space-y-2">
              {analysis.video_structure.map((scene, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <span className="mt-0.5 w-14 flex-shrink-0 font-mono text-[11px] text-emerald-200">{scene.time}</span>
                  <div className="flex-1 text-sm text-white/80">{scene.description}</div>
                </div>
              ))}
            </div>
          ) : activeTab === "cta" ? (
            <div className="space-y-2">
              {analysis.cta_patterns.map((cta, index) => (
                <div key={index} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/12 text-[10px] text-blue-300">
                    {index + 1}
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
                  <div className="mb-2 text-xs text-white/35">{t.tone}</div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-white/80">
                    {analysis.tone_style}
                  </div>
                </div>
              )}
              {analysis.key_takeaways.length > 0 && (
                <div>
                  <div className="mb-2 text-xs text-white/35">{t.takeaways}</div>
                  <div className="space-y-2">
                    {analysis.key_takeaways.map((takeaway, index) => (
                      <div key={index} className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <span className="mt-0.5 text-emerald-300">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5 6.5 12 13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                        <div className="text-sm text-white/80">{takeaway}</div>
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
