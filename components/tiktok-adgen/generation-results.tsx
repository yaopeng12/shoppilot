"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import { buildFullExport, subtitlesToSrt } from "./utils";
import type { GeneratedData, ResultTab } from "./types";

const resultsI18n = {
  en: {
    tabs: { hooks: "Hooks", scripts: "Scripts", voiceovers: "Voiceover", subtitles: "Subtitles" } as Record<ResultTab, string>,
    copy: "Copy",
    copied: "✓ Copied",
    exportAll: "Export All",
    product: "Product",
    clickToCopy: "click to copy",
    script: "Script",
    scenes: "scenes",
    copyScript: "Copy Script",
    voiceover: "Voiceover",
    subtitle: "Subtitle",
    lines: "lines",
    downloadSrt: "↓ SRT",
  },
  zh: {
    tabs: { hooks: "Hooks", scripts: "脚本", voiceovers: "配音", subtitles: "字幕" } as Record<ResultTab, string>,
    copy: "复制",
    copied: "✓ 已复制",
    exportAll: "导出全部",
    product: "商品",
    clickToCopy: "点击复制",
    script: "脚本",
    scenes: "个场景",
    copyScript: "复制脚本",
    voiceover: "配音文案",
    subtitle: "字幕",
    lines: "条",
    downloadSrt: "↓ SRT",
  },
} as const;

function CopyBtn({ onClick, label }: { onClick: () => void; label?: string }) {
  const { locale } = useI18n();
  const t = resultsI18n[locale];
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "h-7 px-3 rounded-lg text-[11px] font-medium transition-all duration-200 border",
        copied
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "border-white/[0.1] text-white/40 hover:text-white hover:bg-white/[0.05] hover:border-white/20"
      )}
    >
      {copied ? t.copied : (label || t.copy)}
    </button>
  );
}

export function GenerationResults({
  data,
  onCopy,
}: {
  data: GeneratedData;
  onCopy: (text: string) => void;
}) {
  const { locale } = useI18n();
  const t = resultsI18n[locale];
  const [tab, setTab] = useState<ResultTab>("hooks");

  const TABS: Array<[ResultTab, string]> = [
    ["hooks", t.tabs.hooks],
    ["scripts", t.tabs.scripts],
    ["voiceovers", t.tabs.voiceovers],
    ["subtitles", t.tabs.subtitles],
  ];
  const TAB_ICONS: Record<ResultTab, string> = { hooks: "🪝", scripts: "🎬", voiceovers: "🎙️", subtitles: "📝" };

  function downloadSrt(index: number) {
    const subs = data.subtitles[index] || [];
    const blob = new Blob([subtitlesToSrt(subs)], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tiktok-subtitles-${index + 1}.srt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <section className="animate-fade-in-up delay-100">
      {/* Product header */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-5 mb-5">
        <div className="flex items-center gap-4">
          {data.product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.product.images[0]}
              alt=""
              className="w-16 h-16 rounded-xl object-cover bg-white/[0.04] border border-white/[0.08] shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0 flex items-center justify-center text-white/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{data.product.title || t.product}</div>
            <div className="text-xs text-white/35 line-clamp-1 mt-0.5">{data.product.description || ""}</div>
          </div>
          {data.product.price && (
            <div className="text-emerald-400 font-bold text-sm shrink-0">{data.product.price}</div>
          )}
          <button
            type="button"
            onClick={() => onCopy(buildFullExport(data))}
            className="shrink-0 h-8 px-3.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all text-xs"
          >
            {t.exportAll}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit mb-5">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
              tab === key
                ? "bg-white text-black shadow-sm"
                : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
            )}
          >
            <span className="text-[13px]">{TAB_ICONS[key]}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Hooks — card grid with visual flair */}
      {tab === "hooks" && (
        <div className="grid md:grid-cols-2 gap-3">
          {data.hooks.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onCopy(h)}
              className="text-left rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/20 p-5 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-violet-400/70 bg-violet-500/10 px-2 py-0.5 rounded-md">{t.clickToCopy}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-[10px] font-bold text-violet-300/70">
                  {i + 1}
                </div>
                <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Hook</span>
              </div>
              <div className="text-[15px] leading-relaxed text-white/75 group-hover:text-white transition-colors font-medium">
                {h}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Scripts — visual timeline */}
      {tab === "scripts" && (
        <div className="space-y-4">
          {data.scripts.map((s) => (
            <div key={s.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t.script} {s.id}</span>
                  <span className="text-[10px] text-white/25 ml-1">{s.scenes.length} {t.scenes}</span>
                </div>
                <CopyBtn
                  onClick={() =>
                    onCopy(s.scenes.map((sc) => `[${sc.time || sc.duration || ""}] ${sc.text}`).join("\n"))
                  }
                  label={t.copyScript}
                />
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[42px] top-0 bottom-0 w-px bg-white/[0.06]" />
                <div className="divide-y divide-white/[0.04]">
                  {s.scenes.map((sc, idx) => (
                    <div key={idx} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className="relative z-10 shrink-0">
                        <div className="w-[22px] h-[22px] rounded-full bg-[#06060a] border-2 border-cyan-500/30 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
                        </div>
                      </div>
                      <div className="min-w-[60px] shrink-0 pt-0.5">
                        <span className="text-[11px] text-cyan-400/70 font-mono font-medium bg-cyan-500/5 px-1.5 py-0.5 rounded">
                          {sc.duration || sc.time || ""}
                        </span>
                      </div>
                      <div className="text-sm text-white/60 leading-relaxed pt-0.5">{sc.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voiceovers — teleprompter style */}
      {tab === "voiceovers" && (
        <div className="space-y-4">
          {data.voiceovers.map((v, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t.voiceover} {i + 1}</span>
                </div>
                <CopyBtn onClick={() => onCopy(v)} />
              </div>
              <div className="p-5">
                <div className="rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] p-6">
                  <div className="space-y-4">
                    {v.split(/(?<=[.!?。！？"])\s+/).filter(Boolean).map((sentence, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-amber-400/40 text-lg leading-none mt-0.5">"</span>
                        <p className="text-[15px] text-white/65 leading-relaxed">{sentence.replace(/^[""]|[""]$/g, "")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtitles — timeline with SRT download */}
      {tab === "subtitles" && (
        <div className="space-y-4">
          {data.subtitles.map((subs, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">{t.subtitle} {i + 1}</span>
                  <span className="text-[10px] text-white/25 ml-1">{subs.length} {t.lines}</span>
                </div>
                <div className="flex gap-2">
                  <CopyBtn onClick={() => onCopy(subs.map((s) => `${s.time} ${s.text}`).join("\n"))} />
                  <button
                    type="button"
                    onClick={() => downloadSrt(i)}
                    className="h-7 px-3 rounded-lg border border-emerald-500/20 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all text-[11px] font-medium"
                  >
                    ↓ SRT
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid gap-1.5">
                  {subs.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className="flex items-center gap-2 shrink-0 w-[90px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-400 transition-colors" />
                        <span className="text-[11px] text-emerald-400/50 font-mono">{row.time}</span>
                      </div>
                      <div className="text-sm text-white/55 group-hover:text-white/75 transition-colors">
                        {row.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
