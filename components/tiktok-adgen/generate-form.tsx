"use client";

import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import { AD_STYLES, TARGET_MARKETS, type AdStyle, type TargetMarket } from "@/lib/tiktok-adgen/generator";

const formI18n = {
  en: {
    inputLabel: "Product URL",
    placeholder: "https://your-store.com/products/...",
    generate: "Generate",
    generating: "Generating...",
    enterUrl: "Please enter a product link",
    invalidUrl: "Please enter a valid URL",
    limitReached: "Daily limit reached.",
    upgrade: "Upgrade",
    examples: "Try these:",
    featureTitle: "What You Get",
    styleLabel: "Creative Style",
    styleAuto: "Auto (AI decides)",
    marketLabel: "Target Market",
    countLabel: "Script Count",
    features: [
      "Works with Shopify, Amazon, WooCommerce & more",
      "8 script styles: pain point, review, plot twist, tutorial...",
      "10 scripts per generation with filming tips & BGM",
      "9 target markets with native localization",
      "Voiceover copy + timed SRT subtitles",
      "Smart hashtag recommendations",
    ],
  },
  zh: {
    inputLabel: "商品链接",
    placeholder: "https://your-store.com/products/...",
    generate: "生成内容",
    generating: "生成中...",
    enterUrl: "请输入商品链接",
    invalidUrl: "请输入有效的 URL",
    limitReached: "今日次数已用完。",
    upgrade: "去升级",
    examples: "试试这些：",
    featureTitle: "你将获得",
    styleLabel: "创意风格",
    styleAuto: "自动（AI 决定）",
    marketLabel: "目标市场",
    countLabel: "脚本数量",
    features: [
      "支持 Shopify、Amazon、WooCommerce 等平台",
      "8 种脚本风格：痛点、测评、反转、教程等",
      "每次生成 10 条脚本，含拍摄建议和 BGM",
      "9 个目标市场，母语级本地化",
      "配音文案 + 带时间轴的 SRT 字幕",
      "智能 Hashtag 推荐",
    ],
  },
} as const;

export function GenerateForm({
  url,
  style,
  targetMarket,
  scriptCount,
  loading,
  err,
  limitMsg,
  authMsg,
  signInLabel,
  onUrlChange,
  onStyleChange,
  onMarketChange,
  onCountChange,
  onGenerate,
  onUpgrade,
  onExample,
}: {
  url: string;
  style: AdStyle | null;
  targetMarket: TargetMarket;
  scriptCount: number;
  loading: boolean;
  err: string | null;
  limitMsg: string | null;
  authMsg: string | null;
  signInLabel: string;
  onUrlChange: (value: string) => void;
  onStyleChange: (value: AdStyle | null) => void;
  onMarketChange: (value: TargetMarket) => void;
  onCountChange: (value: number) => void;
  onGenerate: () => void;
  onUpgrade: () => void;
  onExample: (url: string) => void;
}) {
  const { locale } = useI18n();
  const t = formI18n[locale];

  return (
    <section className="grid lg:grid-cols-5 gap-5 items-start animate-fade-in-up">
      {/* Input area */}
      <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6">
        <div className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">{t.inputLabel}</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 hover:border-white/20"
              onKeyDown={(e) => { if (e.key === "Enter") onGenerate(); }}
            />
          </div>
          <button
            type="button"
            disabled={loading}
            className={cn(
              "h-[50px] px-7 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] whitespace-nowrap flex items-center justify-center gap-2",
              loading
                ? "bg-white/[0.08] text-white/40 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-blue-500"
            )}
            onClick={onGenerate}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.generating}
              </>
            ) : t.generate}
          </button>
        </div>

        {err && (
          <div className="mt-3 text-sm text-rose-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {err}
          </div>
        )}

        {limitMsg && (
          <div className="mt-3 text-sm text-amber-400/90 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l7 13H1L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {limitMsg}{" "}
            <button type="button" className="underline underline-offset-2 hover:text-amber-300 transition-colors" onClick={onUpgrade}>
              {t.upgrade}
            </button>
          </div>
        )}

        {authMsg && (
          <div className="mt-3 text-sm text-violet-400/90 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {authMsg}{" "}
            <a href="/sign-in" className="underline underline-offset-2 hover:text-violet-300 transition-colors">
              {signInLabel}
            </a>
          </div>
        )}

        {/* Market + Count selectors */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-white/40 mb-2 uppercase tracking-wider font-medium">{t.marketLabel}</div>
            <select
              value={targetMarket}
              onChange={(e) => onMarketChange(e.target.value as TargetMarket)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white/80 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.06] appearance-none cursor-pointer"
            >
              {Object.entries(TARGET_MARKETS).map(([key, m]) => (
                <option key={key} value={key} className="bg-[#0a0a14] text-white">
                  {m.flag} {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-2 uppercase tracking-wider font-medium">{t.countLabel}</div>
            <select
              value={scriptCount}
              onChange={(e) => onCountChange(Number(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white/80 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.06] appearance-none cursor-pointer"
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n} className="bg-[#0a0a14] text-white">
                  {n} {locale === "zh" ? "条" : "scripts"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Style selector */}
        <div className="mt-4">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider font-medium">{t.styleLabel}</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onStyleChange(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                !style
                  ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                  : "border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.15]",
              )}
            >
              {t.styleAuto}
            </button>
            {(Object.entries(AD_STYLES) as [AdStyle, (typeof AD_STYLES)[AdStyle]][]).map(
              ([key, val]) => {
                const label = val[locale] || val.en;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onStyleChange(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                      style === key
                        ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                        : "border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.15]",
                    )}
                  >
                    {label.label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-white/30">
          {t.examples}
          <button type="button" className="ml-2 text-white/50 hover:text-white/70 transition-colors underline underline-offset-2" onClick={() => onExample("https://www.allbirds.com/products/mens-tree-runners")}>
            Allbirds
          </button>
          <button type="button" className="ml-3 text-white/50 hover:text-white/70 transition-colors underline underline-offset-2" onClick={() => onExample("https://www.stanley1913.com/products/adventure-quencher-travel-tumbler-40-oz")}>
            Stanley
          </button>
        </div>
      </div>

      {/* Feature list */}
      <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm p-6">
        <div className="text-xs text-white/40 mb-4 uppercase tracking-wider font-medium">{t.featureTitle}</div>
        <ul className="space-y-3.5">
          {t.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/55">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500/15 to-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400" />
                </svg>
              </div>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
