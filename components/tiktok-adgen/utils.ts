import type { GeneratedData, SubtitleRow } from "./types";

export function normalizeUrl(raw: string) {
  let u = raw.trim();
  if (!u) return u;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

export function formatSecondsToSrtTime(sec: number) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  const ms = String(Math.round((sec % 1) * 1000)).padStart(3, "0");
  return `${h}:${m}:${s},${ms}`;
}

export function subtitlesToSrt(subs: SubtitleRow[]) {
  let srt = "";
  subs.forEach((row, i) => {
    const [start, end] = row.time.split(" - ");
    const startSec = parseFloat(start.replace("s", ""));
    const endSec = parseFloat(end.replace("s", ""));
    srt += `${i + 1}\n${formatSecondsToSrtTime(startSec)} --> ${formatSecondsToSrtTime(endSec)}\n${row.text}\n\n`;
  });
  return srt;
}

export function buildFullExport(data: GeneratedData) {
  let out = `# TikTok 广告脚本 — ${data.product.title}\n\n## Hooks\n\n${data.hooks
    .map((h, i) => `${i + 1}. ${h}`)
    .join("\n")}\n\n## 脚本\n\n`;
  data.scripts.forEach((s) => {
    out += `### 脚本 ${s.id}\n`;
    s.scenes.forEach((sc) => {
      out += `- [${sc.time || sc.duration || ""}] ${sc.text}\n`;
    });
    out += "\n";
  });
  out += `## 配音文案\n\n${data.voiceovers.map((v, i) => `### 配音 ${i + 1}\n${v}\n`).join("\n")}\n`;
  return out;
}
