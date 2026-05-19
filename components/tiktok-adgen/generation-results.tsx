"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import { buildFullExport, subtitlesToSrt } from "./utils";
import type { GeneratedData } from "./types";

const resultsI18n = {
  en: {
    copy: "Copy",
    copied: "✓ Copied",
    exportAll: "Export All",
    product: "Product",
    hooks: "Hooks",
    scripts: "Scripts",
    voiceovers: "Voiceover",
    subtitles: "Subtitles",
    scenes: "scenes",
    lines: "lines",
    copyScript: "Copy Script",
    downloadSrt: "↓ SRT",
    generated: "Generated",
  },
  zh: {
    copy: "复制",
    copied: "✓ 已复制",
    exportAll: "导出全部",
    product: "商品",
    hooks: "Hook 开头",
    scripts: "视频脚本",
    voiceovers: "配音文案",
    subtitles: "字幕",
    scenes: "个场景",
    lines: "条",
    copyScript: "复制脚本",
    downloadSrt: "↓ SRT",
    generated: "已生成",
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

// ─── Section header ─────────────────────────────────────────────────
function SectionHeader({
  icon,
  iconBg,
  title,
  count,
  countLabel,
  action,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  count: number;
  countLabel: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[11px] text-white/30">{count} {countLabel}</div>
        </div>
      </div>
      {action}
    </div>
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

  function downloadSrt(index: number) {
    const subs = data.subtitles[index] || [];
    const blob = new Blob([subtitlesToSrt(subs)], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tiktok-subtitles-${index + 1}.srt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const summaryItems = [
    { icon: "🪝", count: data.hooks.length, label: t.hooks },
    { icon: "🎬", count: data.scripts.length, label: t.scripts },
    { icon: "🎙️", count: data.voiceovers.length, label: t.voiceovers },
    { icon: "📝", count: data.subtitles.length, label: t.subtitles },
  ];

  return (
    <section className="animate-fade-in-up delay-100 space-y-5">

      {/* ── Product card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-5">
        <div className="flex items-center gap-4">
          {data.product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.product.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover bg-white/[0.04] border border-white/[0.08] shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0 flex items-center justify-center text-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{data.product.title || t.product}</div>
            <div className="text-xs text-white/30 line-clamp-1 mt-0.5">{data.product.description || ""}</div>
          </div>
          {data.product.price && (
            <div className="text-emerald-400 font-bold text-sm shrink-0">{data.product.price}</div>
          )}
          <button type="button" onClick={() => onCopy(buildFullExport(data))} className="shrink-0 h-8 px-3.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all text-xs">
            {t.exportAll}
          </button>
        </div>
      </div>

      {/* ── Summary bar ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryItems.map((item, i) => (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 flex items-center gap-3">
            <span className="text-lg">{item.icon}</span>
            <div>
              <div className="text-lg font-bold text-white/90">{item.count}</div>
              <div className="text-[10px] text-white/30">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Hooks — horizontal card strip ────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <SectionHeader
          icon={<span className="text-sm">🪝</span>}
          iconBg="bg-gradient-to-br from-violet-500/20 to-blue-500/20"
          title={t.hooks}
          count={data.hooks.length}
          countLabel={t.hooks}
        />
        <div className="grid md:grid-cols-2 gap-3">
          {data.hooks.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onCopy(h)}
              className="text-left rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-violet-500/[0.06] hover:border-violet-500/20 p-4 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-md bg-violet-500/10 flex items-center justify-center text-[10px] font-bold text-violet-400">{i + 1}</span>
                <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium">Hook</span>
              </div>
              <div className="text-sm leading-relaxed text-white/70 group-hover:text-white transition-colors">{h}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Scripts — scene cards ────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <SectionHeader
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
          iconBg="bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
          title={t.scripts}
          count={data.scripts.length}
          countLabel={t.scripts}
        />
        <div className="grid md:grid-cols-2 gap-4">
          {data.scripts.map((s) => (
            <div key={s.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/70">#{s.id}</span>
                  <span className="text-[10px] text-white/25">{s.scenes.length} {t.scenes}</span>
                </div>
                <CopyBtn
                  onClick={() => onCopy(s.scenes.map((sc) => `[${sc.time || sc.duration || ""}] ${sc.text}`).join("\n"))}
                  label={t.copyScript}
                />
              </div>
              <div className="p-3 space-y-0">
                {s.scenes.map((sc, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-2 px-1 rounded-md hover:bg-white/[0.02] transition-colors">
                    <span className="text-[10px] text-cyan-400/60 font-mono bg-cyan-500/5 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                      {sc.duration || sc.time || ""}
                    </span>
                    <span className="text-xs text-white/55 leading-relaxed">{sc.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Voiceovers — teleprompter cards ──────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <SectionHeader
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>}
          iconBg="bg-gradient-to-br from-amber-500/20 to-orange-500/20"
          title={t.voiceovers}
          count={data.voiceovers.length}
          countLabel={t.voiceovers}
        />
        <div className="grid md:grid-cols-2 gap-4">
          {data.voiceovers.map((v, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                <span className="text-xs font-semibold text-white/70">#{i + 1}</span>
                <CopyBtn onClick={() => onCopy(v)} />
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {v.split(/(?<=[.!?。！？"])\s+/).filter(Boolean).map((sentence, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="text-amber-400/30 text-sm leading-none mt-0.5 shrink-0">&ldquo;</span>
                      <p className="text-xs text-white/60 leading-relaxed">{sentence.replace(/^[""]|[""]$/g, "")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Subtitles — table cards with SRT download ────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <SectionHeader
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
          iconBg="bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
          title={t.subtitles}
          count={data.subtitles.length}
          countLabel={t.subtitles}
        />
        <div className="grid md:grid-cols-2 gap-4">
          {data.subtitles.map((subs, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/70">#{i + 1}</span>
                  <span className="text-[10px] text-white/25">{subs.length} {t.lines}</span>
                </div>
                <div className="flex gap-2">
                  <CopyBtn onClick={() => onCopy(subs.map((s) => `${s.time} ${s.text}`).join("\n"))} />
                  <button type="button" onClick={() => downloadSrt(i)} className="h-7 px-3 rounded-lg border border-emerald-500/20 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all text-[11px] font-medium">
                    {t.downloadSrt}
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-0">
                  {subs.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-1.5 px-1 rounded-md hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-1.5 shrink-0 w-[75px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 group-hover:bg-emerald-400 transition-colors" />
                        <span className="text-[10px] text-emerald-400/40 font-mono">{row.time}</span>
                      </div>
                      <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">{row.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
