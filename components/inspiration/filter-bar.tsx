"use client";

import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { CATEGORIES, type InspirationFilters } from "@/lib/inspiration/types";
import { getUiProductCategoryLabel } from "@/lib/localization/markets";

const i18n = {
  en: {
    all: "All categories",
    days7: "7 days",
    days30: "30 days",
    views: "Composite heat",
    likes: "Most liked",
    engagement: "Best score",
    newest: "Newest",
    search: "Search templates...",
  },
  zh: {
    all: "全部品类",
    days7: "7 天",
    days30: "30 天",
    views: "综合热度",
    likes: "最多点赞",
    engagement: "最高评分",
    newest: "最新采集",
    search: "搜索模板...",
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
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.category || ""}
        onChange={(event) => onChange({ ...filters, category: event.target.value || undefined, page: 1 })}
        className={cn(
          "rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-white",
          "transition-all duration-200 hover:border-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
        )}
      >
        <option value="" className="bg-[#0a0a14] text-white">{t.all}</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category} className="bg-[#0a0a14] text-white">
            {getUiProductCategoryLabel(category, locale)}
          </option>
        ))}
      </select>

      <div className="flex overflow-hidden rounded-lg border border-white/[0.1]">
        {(["7d", "30d"] as const).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => onChange({ ...filters, period, page: 1 })}
            className={cn(
              "px-4 py-3 text-sm transition-all duration-200",
              filters.period === period
                ? "bg-emerald-500/15 text-emerald-200"
                : "bg-white/[0.02] text-white/42 hover:bg-white/[0.04] hover:text-white/75",
            )}
          >
            {period === "7d" ? t.days7 : t.days30}
          </button>
        ))}
      </div>

      <select
        value={filters.sort || "views"}
        onChange={(event) => onChange({ ...filters, sort: event.target.value as InspirationFilters["sort"] })}
        className={cn(
          "rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-white",
          "transition-all duration-200 hover:border-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
        )}
      >
        {sortOptions.map((sort) => (
          <option key={sort} value={sort} className="bg-[#0a0a14] text-white">
            {t[sort]}
          </option>
        ))}
      </select>

      <div className="min-w-[220px] flex-1">
        <Input
          placeholder={t.search}
          value={filters.search || ""}
          onChange={(event) => onChange({ ...filters, search: event.target.value || undefined, page: 1 })}
        />
      </div>
    </div>
  );
}
