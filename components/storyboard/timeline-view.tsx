"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";
import type { CameraMovement, StoryboardData, StoryboardFrame } from "@/lib/storyboard/types";
import { CAMERA_LABELS, TRANSITION_LABELS, VERTICAL_DOMAINS } from "@/lib/storyboard/types";

interface TimelineViewProps {
  data: StoryboardData;
}

const cameraIcons: Record<CameraMovement, string> = {
  static: "[]",
  "zoom-in": "+",
  "zoom-out": "-",
  "pan-left": "<",
  "pan-right": ">",
  "tilt-up": "^",
  "tilt-down": "v",
  tracking: "*",
};

export function TimelineView({ data }: TimelineViewProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const vertical = VERTICAL_DOMAINS[data.metadata.vertical] || VERTICAL_DOMAINS.general;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white/90">{data.product.title}</h2>
          <p className="text-sm text-white/40 mt-1">
            {vertical.label} / {data.metadata.style} / {data.totalDuration}s / {data.frames.length} scenes
          </p>
          <p className="mt-2 max-w-2xl text-sm text-white/55">{data.metadata.creativeAngle}</p>
        </div>
        <div className="flex gap-2">
          <ExportButton data={data} format="json" />
          <ExportButton data={data} format="markdown" />
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex justify-between mb-2 px-2">
          {data.frames.map((frame, i) => (
            <div key={i} className="text-[10px] text-white/30 font-mono">
              {frame.startTime}s
            </div>
          ))}
          <div className="text-[10px] text-white/30 font-mono">{data.totalDuration}s</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.frames.map((frame, i) => (
            <FrameCard
              key={i}
              frame={frame}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="text-xs text-white/40 mb-2">Target audience</div>
          <p className="text-sm text-white/70">{data.metadata.targetAudience}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="text-xs text-white/40 mb-2">Production notes</div>
          <ul className="space-y-1.5 text-sm text-white/70">
            {data.metadata.productionNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface FrameCardProps {
  frame: StoryboardFrame;
  expanded: boolean;
  onToggle: () => void;
}

function FrameCard({ frame, expanded, onToggle }: FrameCardProps) {
  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-200",
        "bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden",
        "hover:border-white/[0.15] hover:bg-white/[0.05]",
        expanded && "border-violet-500/30 bg-violet-500/[0.05]"
      )}
      onClick={onToggle}
    >
      <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-violet-600/80 flex items-center justify-center text-xs font-medium text-white">
        {frame.scene}
      </div>

      <div className="absolute top-3 right-3 flex gap-1.5">
        <span className="px-2 py-0.5 rounded-md bg-white/[0.1] text-[10px] text-white/60">
          {cameraIcons[frame.camera]} {CAMERA_LABELS[frame.camera]}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white/[0.1] text-[10px] text-white/60">
          {frame.duration}s
        </span>
      </div>

      <div className="pt-12 p-4">
        <p className={cn("text-sm text-white/80 leading-relaxed", !expanded && "line-clamp-3")}>
          {frame.visual}
        </p>

        {expanded && (
          <div className="mt-4 space-y-3 animate-fade-in-up">
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Text overlay</div>
              <p className="text-sm text-white/70 font-medium">&ldquo;{frame.textOverlay}&rdquo;</p>
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Narration</div>
              <p className="text-sm text-white/60 italic">{frame.narration}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Camera</div>
                <p className="text-xs text-white/60">{CAMERA_LABELS[frame.camera]}</p>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Transition</div>
                <p className="text-xs text-white/60">{TRANSITION_LABELS[frame.transition]}</p>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Timing</div>
                <p className="text-xs text-white/60">
                  {frame.startTime}s - {frame.endTime}s
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="text-[10px] text-white/30 text-center">
          {expanded ? "Click to collapse" : "Click to expand"}
        </div>
      </div>
    </div>
  );
}

function ExportButton({ data, format }: { data: StoryboardData; format: "json" | "markdown" }) {
  function handleExport() {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      filename = `storyboard-${data.product.title?.replace(/\s+/g, "-").toLowerCase() || "export"}.json`;
      mimeType = "application/json";
    } else {
      content = buildMarkdown(data);
      filename = `storyboard-${data.product.title?.replace(/\s+/g, "-").toLowerCase() || "export"}.md`;
      mimeType = "text/markdown";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="px-3 py-1.5 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] text-xs transition-all"
    >
      Export {format.toUpperCase()}
    </button>
  );
}

function buildMarkdown(data: StoryboardData): string {
  const vertical = VERTICAL_DOMAINS[data.metadata.vertical] || VERTICAL_DOMAINS.general;
  const lines: string[] = [
    "# TikTok Ad Storyboard",
    "",
    `**Product:** ${data.product.title}`,
    `**Vertical:** ${vertical.label}`,
    `**Style:** ${data.metadata.style}`,
    `**Creative angle:** ${data.metadata.creativeAngle}`,
    `**Duration:** ${data.totalDuration}s`,
    `**Target audience:** ${data.metadata.targetAudience}`,
    "",
    "## Production Notes",
    "",
    ...data.metadata.productionNotes.map((note) => `- ${note}`),
    "",
    "---",
    "",
  ];

  for (const frame of data.frames) {
    lines.push(`## Scene ${frame.scene} (${frame.startTime}s - ${frame.endTime}s)`);
    lines.push("");
    lines.push(`**Visual:** ${frame.visual}`);
    lines.push("");
    lines.push(`**Camera:** ${CAMERA_LABELS[frame.camera]}`);
    lines.push("");
    lines.push(`**Text Overlay:** "${frame.textOverlay}"`);
    lines.push("");
    lines.push(`**Narration:** ${frame.narration}`);
    lines.push("");
    lines.push(`**Transition:** ${TRANSITION_LABELS[frame.transition]}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}
