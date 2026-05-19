"use client";

import { useState } from "react";

import { cn } from "@/components/ui/cn";
import { buildFullExport, subtitlesToSrt } from "./utils";
import type { GeneratedData, ResultTab } from "./types";

const TABS: Array<[ResultTab, string]> = [
  ["hooks", "Hooks"],
  ["scripts", "脚本"],
  ["voiceovers", "配音"],
  ["subtitles", "字幕"],
];

export function GenerationResults({
  data,
  onCopy,
}: {
  data: GeneratedData;
  onCopy: (text: string) => void;
}) {
  const [tab, setTab] = useState<ResultTab>("hooks");

  function downloadSrt(index: number) {
    const subs = data.subtitles[index] || [];
    const blob = new Blob([subtitlesToSrt(subs)], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tiktok-subtitles-${index + 1}.srt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <section className="space-y-5 animate-fade-in-up delay-100">
      {/* Product card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        {data.product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.product.images[0]}
            alt=""
            className="w-20 h-20 rounded-xl object-cover bg-white/[0.04] border border-white/[0.08]"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-white/[0.04] border border-white/[0.08]" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold truncate">
            {data.product.title || "商品"}
          </div>
          <div className="text-sm text-white/40 line-clamp-2 mt-1">
            {data.product.description || "暂无描述"}
          </div>
          {data.product.price ? (
            <div className="mt-2 text-emerald-400 font-bold text-sm">
              {data.product.price}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="h-8 px-3.5 rounded-lg border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-xs shrink-0"
          onClick={() => onCopy(buildFullExport(data))}
        >
          复制全部
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              tab === key
                ? "bg-white text-black shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Hooks */}
      {tab === "hooks" ? (
        <div className="grid md:grid-cols-2 gap-3">
          {data.hooks.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onCopy(h)}
              className="text-left rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] p-5 transition-all duration-300 group"
            >
              <div className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">
                Hook #{i + 1}
              </div>
              <div className="text-sm leading-relaxed text-white/70 group-hover:text-white/90 transition-colors">
                {h}
              </div>
              <div className="mt-3 text-[10px] text-white/20 group-hover:text-white/40 transition-colors">
                点击复制
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {/* Scripts */}
      {tab === "scripts" ? (
        <div className="space-y-4">
          {data.scripts.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-sm font-semibold">脚本 {s.id}</div>
                <button
                  type="button"
                  className="h-7 px-3 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-[11px]"
                  onClick={() =>
                    onCopy(
                      s.scenes
                        .map(
                          (sc) =>
                            `[${sc.time || sc.duration || ""}] ${sc.text}`
                        )
                        .join("\n")
                    )
                  }
                >
                  复制此脚本
                </button>
              </div>
              <div className="space-y-2">
                {s.scenes.map((sc, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5"
                  >
                    <div className="text-[11px] text-cyan-400/80 min-w-[56px] font-mono">
                      {sc.duration || sc.time || ""}
                    </div>
                    <div className="text-sm text-white/60 leading-relaxed">
                      {sc.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Voiceovers */}
      {tab === "voiceovers" ? (
        <div className="space-y-4">
          {data.voiceovers.map((v, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-sm font-semibold">配音文案 {i + 1}</div>
                <button
                  type="button"
                  className="h-7 px-3 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-[11px]"
                  onClick={() => onCopy(v)}
                >
                  复制
                </button>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-sm leading-relaxed text-white/55">
                {v}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Subtitles */}
      {tab === "subtitles" ? (
        <div className="space-y-4">
          {data.subtitles.map((subs, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-sm font-semibold">字幕 {i + 1}</div>
                <button
                  type="button"
                  className="h-7 px-3 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-[11px]"
                  onClick={() => downloadSrt(i)}
                >
                  下载 SRT
                </button>
              </div>
              <div className="space-y-1.5">
                {subs.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5"
                  >
                    <div className="text-[11px] text-cyan-400/80 min-w-[100px] font-mono">
                      {row.time}
                    </div>
                    <div className="text-sm text-white/60 leading-relaxed">
                      {row.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
