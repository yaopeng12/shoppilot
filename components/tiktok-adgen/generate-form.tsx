"use client";

import { cn } from "@/components/ui/cn";

export function GenerateForm({
  url,
  loading,
  err,
  limitMsg,
  onUrlChange,
  onGenerate,
  onUpgrade,
  onExample,
}: {
  url: string;
  loading: boolean;
  err: string | null;
  limitMsg: string | null;
  onUrlChange: (value: string) => void;
  onGenerate: () => void;
  onUpgrade: () => void;
  onExample: (url: string) => void;
}) {
  return (
    <section className="grid lg:grid-cols-3 gap-5 items-start animate-fade-in-up">
      <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6">
        <div className="text-xs text-white/40 mb-3 uppercase tracking-wider">Shopify 商品链接</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://xxx.myshopify.com/products/..."
            className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 hover:border-white/20"
          />
          <button
            type="button"
            disabled={loading}
            className={cn(
              "h-[50px] px-6 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] whitespace-nowrap",
              loading
                ? "bg-white/[0.08] text-white/40 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
            )}
            onClick={onGenerate}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                生成中...
              </span>
            ) : (
              "生成内容"
            )}
          </button>
        </div>
        {err ? (
          <div className="mt-3 text-sm text-rose-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {err}
          </div>
        ) : null}
        {limitMsg ? (
          <div className="mt-3 text-sm text-amber-400/90 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l7 13H1L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {limitMsg}{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-amber-300 transition-colors"
              onClick={onUpgrade}
            >
              去升级
            </button>
          </div>
        ) : null}

        <div className="mt-4 text-xs text-white/30">
          示例：
          <button
            type="button"
            className="ml-2 text-white/50 hover:text-white/70 transition-colors underline underline-offset-2"
            onClick={() => onExample("https://www.allbirds.com/products/mens-tree-runners")}
          >
            Allbirds
          </button>
          <button
            type="button"
            className="ml-3 text-white/50 hover:text-white/70 transition-colors underline underline-offset-2"
            onClick={() => onExample("https://www.stanley1913.com/products/adventure-quencher-travel-tumbler-40-oz")}
          >
            Stanley
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6">
        <div className="text-xs text-white/40 mb-3 uppercase tracking-wider">功能说明</div>
        <ul className="text-sm text-white/50 leading-7 space-y-1">
          {[
            "自动抓取商品标题/描述/价格/图片",
            "生成 10 条 Hooks、10 套脚本",
            "自动配音文案与字幕（支持 SRT 下载）",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-violet-400 mt-0.5 text-xs">●</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
