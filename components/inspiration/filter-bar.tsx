"use client";

import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { CATEGORIES, type InspirationFilters } from "@/lib/inspiration/types";

const i18n = {
  en: {
    category: "Category",
    all: "All",
    period: "Period",
    days7: "7 Days",
    days30: "30 Days",
    sort: "Sort",
    views: "Most Viewed",
    likes: "Most Liked",
    engagement: "Engagement",
    newest: "Newest",
    search: "Search videos...",
  },
  zh: {
    category: "品类",
    all: "全部",
    period: "时间",
    days7: "7天",
    days30: "30天",
    sort: "排序",
    views: "最多播放",
    likes: "最多点赞",
    engagement: "互动率",
    newest: "最新",
    search: "搜索视频...",
  },
} as const;

const sortOptions = ["views", "likes", "engagement", "newest"] as const;

export function FilterBar({
  filters,
  onChange,
}: {
  filters: InspirationFilters;
  onChange: (f: InspirationFilters) => void;
}) {
  const { locale } = useI18n();
  const t = i18n[locale];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Category */}
      <select
        value={filters.category || ""}
        onChange={(e) => onChange({ ...filters, category: e.target.value || undefined, page: 1 })}
        className={cn(
          "rounded-xl px-4 py-3 text-sm bg-white/[0.04] border border-white/[0.1]",
          "text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
          "hover:border-white/20 transition-all duration-200",
        )}
      >
        <option value="">{t.all}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Period */}
      <div className="flex rounded-xl border border-white/[0.1] overflow-hidden">
        {(["7d", "30d"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange({ ...filters, period: p, page: 1 })}
            className={cn(
              "px-4 py-3 text-sm transition-all duration-200",
              filters.period === p
                ? "bg-violet-600/20 text-violet-300"
                : "bg-white/[0.02] text-white/40 hover:text-white/70 hover:bg-white/[0.04]",
            )}
          >
            {p === "7d" ? t.days7 : t.days30}
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={filters.sort || "views"}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as InspirationFilters["sort"] })}
        className={cn(
          "rounded-xl px-4 py-3 text-sm bg-white/[0.04] border border-white/[0.1]",
          "text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
          "hover:border-white/20 transition-all duration-200",
        )}
      >
        {sortOptions.map((s) => (
          <option key={s} value={s}>{t[s]}</option>
        ))}
      </select>

      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder={t.search}
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined, page: 1 })}
        />
      </div>
    </div>
  );
}
