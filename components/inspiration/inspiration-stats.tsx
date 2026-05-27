"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/context";
import type { InspirationStats } from "@/lib/inspiration/types";
import { getUiProductCategoryLabel } from "@/lib/localization/markets";

const i18n = {
  en: {
    totalVideos: "Template candidates",
    topCategory: "Main category",
    avgEngagement: "Avg score",
    lastUpdate: "Last update",
    none: "No data",
    never: "Never",
    justNow: "Just now",
  },
  zh: {
    totalVideos: "候选模板",
    topCategory: "主要品类",
    avgEngagement: "平均评分",
    lastUpdate: "最近更新",
    none: "暂无数据",
    never: "暂无",
    justNow: "刚刚",
  },
} as const;

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-white/35">{label}</div>
        <div className="truncate text-sm font-semibold text-white/90">{value}</div>
      </div>
    </div>
  );
}

function formatTimeAgo(iso: string | null, locale: "en" | "zh"): string {
  const t = i18n[locale];
  if (!iso) return t.never;

  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return t.justNow;
  if (hours < 24) return locale === "zh" ? `${hours} 小时前` : `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return locale === "zh" ? `${days} 天前` : `${days}d ago`;
}

function topCategory(counts: Record<string, number>, locale: "en" | "zh"): string {
  let max = 0;
  let category = "-";
  for (const [key, value] of Object.entries(counts)) {
    if (value > max) {
      max = value;
      category = key;
    }
  }
  return category === "-" ? category : getUiProductCategoryLabel(category, locale);
}

export function InspirationStatsSection({ stats }: { stats: InspirationStats }) {
  const { locale } = useI18n();
  const t = i18n[locale];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" /><path d="M6.5 6 10.5 8 6.5 10V6Z" fill="currentColor" /></svg>}
        label={t.totalVideos}
        value={stats.totalVideos.toLocaleString()}
      />
      <StatCard
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2 9.8 5.6 14 6.2 11 9.1 11.7 13.2 8 11.4 4.3 13.2 5 9.1 2 6.2 6.2 5.6 8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>}
        label={t.topCategory}
        value={topCategory(stats.categoryCounts, locale)}
      />
      <StatCard
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12V7M8 12V4M12 12V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
        label={t.avgEngagement}
        value={stats.avgEngagement ? String(stats.avgEngagement) : t.none}
      />
      <StatCard
        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" /><path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>}
        label={t.lastUpdate}
        value={formatTimeAgo(stats.latestScrape, locale)}
      />
    </div>
  );
}
