"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import { buildFullExport, subtitlesToSrt } from "./utils";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import type { GeneratedData, Script } from "./types";

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
    variants: "Variants",
    generateVariants: "Generate Variants",
    generating: "Generating...",
    hook: "Hook",
    tone: "Tone",
    duration: "Duration",
    cta: "CTA",
    variantOf: "Variant",
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
    variants: "变体",
    generateVariants: "生成变体",
    generating: "生成中...",
    hook: "Hook",
    tone: "语气",
    duration: "时长",
    cta: "CTA",
    variantOf: "变体",
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

type Variant = {
  dimension: string;
  hook: { text: string; type: string };
  scenes: { time?: string; text: string; action?: string }[];
  cta: { text: string; type: string };
  tone_notes: string;
  filming_tips: string;
  bgm_suggestion: string;
};

type ResultsI18n = (typeof resultsI18n)["en"];

function VariantPanel({
  script,
  product,
  onCopy,
  t,
}: {
  script: Script;
  product: GeneratedData["product"];
  onCopy: (text: string) => void;
  t: ResultsI18n;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selected, setSelected] = useState<string[]>(["hook", "cta"]);

  const dims = [
    { key: "hook", label: t.hook },
    { key: "tone", label: t.tone },
    { key: "duration", label: t.duration },
    { key: "cta", label: t.cta },
  ];

  async function generate() {
    setLoading(true);
    try {
      const r = await apiFetch<{ variants: Variant[] }>("/api/variants", {
        method: "POST",
        body: JSON.stringify({
          product: { title: product.title, description: product.description, price: product.price },
          script,
          dimensions: selected,
          count: selected.length,
        }),
      });
      if (r.ok && r.data?.variants) setVariants(r.data.variants);
    } catch {} finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-7 px-3 rounded-lg text-[11px] font-medium transition-all duration-200 border border-white/[0.1] text-white/40 hover:text-white hover:bg-white/[0.05]"
      >
        {t.variants}
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {dims.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelected(selected.includes(d.key) ? selected.filter((x) => x !== d.key) : [...selected, d.key])}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all",
                  selected.includes(d.key)
                    ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                    : "border-white/[0.08] text-white/35 hover:text-white/60",
                )}
              >
                {d.label}
              </button>
            ))}
            <button
              type="button"
              disabled={loading || selected.length === 0}
              onClick={generate}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-semibold transition-all ml-auto",
                loading || selected.length === 0
                  ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500",
              )}
            >
              {loading ? t.generating : t.generateVariants}
            </button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/[0.05]">
              {variants.map((v, i) => (
                <div key={i} className="rounded-lg border border-white/[0.05] bg-white/[0.01] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-violet-400 uppercase tracking-wider font-medium">
                      {t.variantOf}: {v.dimension}
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopy(v.scenes.map((sc) => `[${sc.time || ""}] ${sc.text}`).join("\n"))}
                      className="h-6 px-2 rounded-md text-[10px] font-medium border border-white/[0.08] text-white/35 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      {t.copy}
                    </button>
                  </div>
                  <div className="text-[11px] text-white/60 mb-1">
                    <span className="text-violet-300/60">Hook:</span> &ldquo;{v.hook.text}&rdquo;
                  </div>
                  {v.scenes.slice(0, 3).map((sc, idx) => (
                    <div key={idx} className="text-[10px] text-white/40 ml-2">
                      [{sc.time}] {sc.text}
                    </div>
                  ))}
                  {v.scenes.length > 3 && (
                    <div className="text-[10px] text-white/20 ml-2">+{v.scenes.length - 3} more scenes</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
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
                  {s.style && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 font-medium">
                      {s.style.replace(/_/g, " ")}
                    </span>
                  )}
                  <span className="text-[10px] text-white/25">{s.scenes.length} {t.scenes}</span>
                </div>
                <CopyBtn
                  onClick={() => onCopy(s.scenes.map((sc) => `[${sc.time || ""}] ${sc.text}`).join("\n"))}
                  label={t.copyScript}
                />
              </div>

              {/* Hook */}
              {s.hook && (
                <div className="px-4 py-2.5 border-b border-white/[0.04] bg-violet-500/[0.03]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-violet-400/60 uppercase tracking-wider">Hook</span>
                    {s.hook.type && <span className="text-[10px] text-white/20">({s.hook.type})</span>}
                  </div>
                  <div className="text-xs text-white/70 leading-relaxed">&ldquo;{s.hook.text}&rdquo;</div>
                </div>
              )}

              {/* Scenes */}
              <div className="p-3 space-y-0">
                {s.scenes.map((sc, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-2 px-1 rounded-md hover:bg-white/[0.02] transition-colors">
                    <span className="text-[10px] text-cyan-400/60 font-mono bg-cyan-500/5 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                      {sc.time || ""}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-white/55 leading-relaxed">{sc.text}</span>
                      {sc.action && (
                        <div className="text-[10px] text-white/25 mt-0.5 italic">{sc.action}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA + Tips */}
              {(s.cta || s.tone_notes || s.filming_tips || s.bgm_suggestion) && (
                <div className="px-4 py-3 border-t border-white/[0.04] space-y-2">
                  {s.cta && (
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider shrink-0 mt-0.5">CTA</span>
                      <span className="text-[11px] text-white/50">{s.cta.text} <span className="text-white/20">({s.cta.type})</span></span>
                    </div>
                  )}
                  {s.filming_tips && (
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-amber-400/60 uppercase tracking-wider shrink-0 mt-0.5">Tips</span>
                      <span className="text-[11px] text-white/40">{s.filming_tips}</span>
                    </div>
                  )}
                  {s.bgm_suggestion && (
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-pink-400/60 uppercase tracking-wider shrink-0 mt-0.5">BGM</span>
                      <span className="text-[11px] text-white/40">{s.bgm_suggestion}</span>
                    </div>
                  )}
                  {s.tone_notes && (
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-blue-400/60 uppercase tracking-wider shrink-0 mt-0.5">Tone</span>
                      <span className="text-[11px] text-white/40">{s.tone_notes}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="px-4 pb-3">
                <VariantPanel script={s} product={data.product} onCopy={onCopy} t={t as ResultsI18n} />
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

      {/* ── Hashtags ──────────────────────────────────────────────────── */}
      {data.hashtags && data.hashtags.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <SectionHeader
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-pink-400"><path d="M4 2l-1 12M13 2l-1 12M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.2"/></svg>}
            iconBg="bg-gradient-to-br from-pink-500/20 to-rose-500/20"
            title="Hashtags"
            count={data.hashtags.length}
            countLabel="tags"
          />
          <div className="flex flex-wrap gap-2">
            {data.hashtags.map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onCopy(tag)}
                className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-200"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
