"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import type { KnowledgeEntry } from "@/lib/inspiration/types";

const pageI18n = {
  en: {
    badge: "AI-Powered Insights",
    title: "Creative Knowledge Base",
    desc: "Templates and patterns extracted from hundreds of top-performing TikTok product ads. Use these to craft your next viral ad.",
    hooks: "Hook Patterns",
    structures: "Video Structures",
    ctas: "CTA Templates",
    tones: "Tone Profiles",
    hashtags: "Top Hashtags",
    summary: "Strategic Summary",
    videosAnalyzed: "videos analyzed",
    avgDuration: "avg duration",
    seconds: "s",
    frequency: "frequency",
    engagement: "engagement",
    bestFor: "best for",
    noData: "No knowledge base entries yet. Run a scrape job first.",
    viewInspiration: "View Inspiration Library",
  },
  zh: {
    badge: "AI 驱动洞察",
    title: "创意知识库",
    desc: "从数百条热门 TikTok 带货视频中提取的模板和模式。用它们来打造你的下一个爆款广告。",
    hooks: "Hook 模式",
    structures: "视频结构模板",
    ctas: "CTA 模板",
    tones: "风格画像",
    hashtags: "热门标签",
    summary: "策略总结",
    videosAnalyzed: "条视频已分析",
    avgDuration: "平均时长",
    seconds: "秒",
    frequency: "出现频次",
    engagement: "互动率",
    bestFor: "适用场景",
    noData: "暂无知识库数据，请先运行抓取任务。",
    viewInspiration: "查看灵感库",
  },
} as const;

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-md bg-violet-600/15 flex items-center justify-center text-violet-400">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white/90">{title}</h3>
    </div>
  );
}

type PageI18n = (typeof pageI18n)["en"];

function CategoryCard({ entry, t }: { entry: KnowledgeEntry; t: PageI18n }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">{entry.category}</h2>
          <div className="flex items-center gap-3 text-[11px] text-white/35 mt-1">
            <span>{entry.video_count} {t.videosAnalyzed}</span>
            <span>{t.avgDuration}: {entry.avg_duration}{t.seconds}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      {entry.summary && (
        <div className="rounded-xl bg-violet-600/5 border border-violet-500/10 p-3 text-xs text-violet-200/80 leading-relaxed">
          {entry.summary}
        </div>
      )}

      {/* Hook Patterns */}
      {entry.hook_patterns.length > 0 && (
        <div>
          <SectionTitle
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v5M5 4l3-2 3 2M4 9h8v5H4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>}
            title={t.hooks}
          />
          <div className="space-y-2">
            {entry.hook_patterns.map((h, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-violet-300">{h.pattern}</span>
                  {h.frequency > 0 && (
                    <span className="text-[10px] text-white/30">{t.frequency}: {h.frequency}</span>
                  )}
                </div>
                <div className="text-xs text-white/60 italic">&ldquo;{h.example}&rdquo;</div>
                {h.avg_engagement > 0 && (
                  <div className="text-[10px] text-emerald-400/70 mt-1">{t.engagement}: {h.avg_engagement}%</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structure Templates */}
      {entry.structure_templates.length > 0 && (
        <div>
          <SectionTitle
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="9" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>}
            title={t.structures}
          />
          <div className="space-y-3">
            {entry.structure_templates.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="text-xs font-semibold text-blue-300 mb-2">{s.name}</div>
                <div className="space-y-1">
                  {s.scenes.map((sc, j) => (
                    <div key={j} className="flex items-start gap-2 text-[11px]">
                      <span className="text-white/25 font-mono w-10 flex-shrink-0">{sc.time}</span>
                      <span className="text-white/60">{sc.description}</span>
                    </div>
                  ))}
                </div>
                {s.best_for && (
                  <div className="text-[10px] text-white/30 mt-2">{t.bestFor}: {s.best_for}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs + Tones + Hashtags in a grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* CTAs */}
        {entry.cta_templates.length > 0 && (
          <div>
            <SectionTitle
              icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              title={t.ctas}
            />
            <div className="space-y-1.5">
              {entry.cta_templates.map((c, i) => (
                <div key={i} className="text-xs text-white/60 rounded-lg bg-white/[0.03] px-3 py-2 border border-white/[0.04]">
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tones */}
        {entry.tone_profiles.length > 0 && (
          <div>
            <SectionTitle
              icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 9.5s1 1.5 2.5 1.5 2.5-1.5 2.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
              title={t.tones}
            />
            <div className="space-y-1.5">
              {entry.tone_profiles.map((tp, i) => (
                <div key={i} className="text-xs text-white/60 rounded-lg bg-white/[0.03] px-3 py-2 border border-white/[0.04]">
                  {tp}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {entry.top_hashtags.length > 0 && (
          <div>
            <SectionTitle
              icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 2l-1 12M13 2l-1 12M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.2"/></svg>}
              title={t.hashtags}
            />
            <div className="flex flex-wrap gap-1.5">
              {entry.top_hashtags.map((tag, i) => (
                <span key={i} className="text-[11px] text-white/50 rounded-full bg-white/[0.04] px-2.5 py-1 border border-white/[0.06]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const { locale } = useI18n();
  const { isSignedIn } = useUser();
  const t = pageI18n[locale];
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ entries: KnowledgeEntry[] }>("/api/inspiration/knowledge").then(({ data }) => {
      if (data) setEntries(data.entries);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#06060a] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        <Navbar isSignedIn={!!isSignedIn} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-white/50 font-medium tracking-wide uppercase">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 3h12v10H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              {t.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-sm text-white/40 leading-relaxed">{t.desc}</p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-16 text-white/30 text-sm">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-white/30 text-sm">{t.noData}</div>
              <Link
                href="/inspiration"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.1] text-xs text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                {t.viewInspiration}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <CategoryCard key={entry.id} entry={entry} t={t as PageI18n} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
