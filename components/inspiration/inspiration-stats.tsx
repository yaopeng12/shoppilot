"use client";

import { useI18n } from "@/lib/i18n/context";
import type { InspirationStats } from "@/lib/inspiration/types";

const i18n = {
  en: {
    totalVideos: "Videos Analyzed",
    topCategory: "Top Category",
    avgEngagement: "Avg Engagement",
    lastUpdate: "Last Update",
    none: "No data",
  },
  zh: {
    totalVideos: "已分析视频",
    topCategory: "热门品类",
    avgEngagement: "平均互动率",
    lastUpdate: "最近更新",
    none: "暂无数据",
  },
} as const;

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400">
        {icon}
      </div>
      <div>
        <div className="text-[11px] text-white/35 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-white/90">{value}</div>
      </div>
    </div>
  );
}

function formatTimeAgo(iso: string | null, locale: string): string {
  if (!iso) return locale === "zh" ? "暂无" : "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return locale === "zh" ? "刚刚" : "Just now";
  if (hours < 24) return locale === "zh" ? `${hours}小时前` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return locale === "zh" ? `${days}天前` : `${days}d ago`;
}

function topCategory(counts: Record<string, number>): string {
  let max = 0;
  let cat = "—";
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      cat = k;
    }
  }
  return cat;
}

export function InspirationStatsSection({ stats }: { stats: InspirationStats }) {
  const { locale } = useI18n();
  const t = i18n[locale];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><polygon points="6.5,6 6.5,10 10.5,8" fill="currentColor"/></svg>}
        label={t.totalVideos}
        value={stats.totalVideos.toLocaleString()}
      />
      <StatCard
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.8 3.6L14 6.2l-3 2.9.7 4.1L8 11.4 4.3 13.2l.7-4.1-3-2.9 4.2-.6L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>}
        label={t.topCategory}
        value={topCategory(stats.categoryCounts)}
      />
      <StatCard
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12V7M8 12V4M12 12V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        label={t.avgEngagement}
        value={stats.avgEngagement ? `${stats.avgEngagement}%` : t.none}
      />
      <StatCard
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
        label={t.lastUpdate}
        value={formatTimeAgo(stats.latestScrape, locale)}
      />
    </div>
  );
}
