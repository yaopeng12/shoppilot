"use client";

import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";

const formI18n = {
  en: {
    inputLabel: "Shopify Product URL",
    placeholder: "https://your-store.myshopify.com/products/...",
    generate: "Generate",
    generating: "Generating...",
    enterUrl: "Please enter a Shopify product link",
    invalidUrl: "Please enter a valid URL",
    limitReached: "Daily limit reached.",
    upgrade: "Upgrade",
    examples: "Try these:",
    featureTitle: "What You Get",
    features: [
      "Auto-fetch product title, description, price & images",
      "5 AI-generated TikTok hooks",
      "2 complete video scripts with scene breakdowns",
      "Voiceover copy + timed SRT subtitles",
    ],
  },
  zh: {
    inputLabel: "Shopify 商品链接",
    placeholder: "https://your-store.myshopify.com/products/...",
    generate: "生成内容",
    generating: "生成中...",
    enterUrl: "请输入 Shopify 商品链接",
    invalidUrl: "请输入有效的 URL",
    limitReached: "今日次数已用完。",
    upgrade: "去升级",
    examples: "试试这些：",
    featureTitle: "你将获得",
    features: [
      "自动抓取商品标题、描述、价格和图片",
      "5 条 AI 生成的 TikTok Hook",
      "2 套完整视频脚本，含分镜和时间轴",
      "配音文案 + 带时间轴的 SRT 字幕",
    ],
  },
} as const;

export function GenerateForm({
  url,
  loading,
  err,
  limitMsg,
  authMsg,
  signInLabel,
  onUrlChange,
  onGenerate,
  onUpgrade,
  onExample,
}: {
  url: string;
  loading: boolean;
  err: string | null;
  limitMsg: string | null;
  authMsg: string | null;
  signInLabel: string;
  onUrlChange: (value: string) => void;
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
