"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { TargetMarketSelect } from "@/components/localization/target-market-select";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { useI18n } from "@/lib/i18n/context";
import { DEFAULT_TARGET_MARKET, type TargetMarketCode } from "@/lib/localization/markets";
import type { KnowledgeEntry } from "@/lib/inspiration/types";

const pageI18n = {
  en: {
    badge: "Pet Cleaning Knowledge Base",
    title: "Creative Pattern Library",
    desc: "Reusable hooks, structures, CTAs, tones, and hashtags extracted from pet cleaning video research.",
    hooks: "Hook Patterns",
    structures: "Video Structures",
    ctas: "CTA Templates",
    tones: "Tone Profiles",
    hashtags: "Top Hashtags",
    videosAnalyzed: "videos analyzed",
    avgDuration: "avg duration",
    seconds: "s",
    noData: "No knowledge entries yet. Add or import pet cleaning video research first.",
    viewInspiration: "View Template Research",
    market: "Knowledge market",
    marketHint: "Localizes hook examples, CTA, tone, and structure notes.",
  },
  zh: {
    badge: "宠物清洁知识库",
    title: "创意结构库",
    desc: "从宠物清洁视频研究中沉淀可复用的 Hook、视频结构、CTA、语气和标签。",
    hooks: "Hook 模式",
    structures: "视频结构",
    ctas: "CTA 模板",
    tones: "语气风格",
    hashtags: "热门标签",
    videosAnalyzed: "条视频已分析",
    avgDuration: "平均时长",
    seconds: "秒",
    noData: "暂无知识库内容，请先导入或分析宠物清洁视频。",
    viewInspiration: "查看模板研究",
    market: "知识库市场",
    marketHint: "按目标市场本地化 Hook 示例、CTA、语气和结构说明。",
  },
} as const;

type PageCopy = (typeof pageI18n)["en"];

export default function KnowledgePage() {
  const { locale } = useI18n();
  const { data: session } = useSession();
  const t = pageI18n[locale];
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [targetMarket, setTargetMarket] = useState<TargetMarketCode>(DEFAULT_TARGET_MARKET);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ entries: KnowledgeEntry[] }>(`/api/inspiration/knowledge?targetMarket=${targetMarket}`).then((response) => {
      if (response.data) setEntries(response.data.entries);
      setLoading(false);
    });
  }, [targetMarket]);

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      <Navbar isSignedIn={!!session?.user} user={session?.user} />

      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-20 pt-12 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/50">
            {t.badge}
          </div>
          <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {t.title}
          </h1>
          <p className="text-sm leading-7 text-white/45">{t.desc}</p>
        </div>

        <div className="mx-auto max-w-sm">
          <TargetMarketSelect
            value={targetMarket}
            onChange={setTargetMarket}
            label={t.market}
            hint={t.marketHint}
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-white/30">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="space-y-4 py-16 text-center">
            <div className="text-sm text-white/35">{t.noData}</div>
            <Link
              href="/inspiration"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2 text-xs text-white/55 transition-all hover:bg-white/[0.05] hover:text-white"
            >
              {t.viewInspiration}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <CategoryCard key={entry.id} entry={entry} t={t as PageCopy} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CategoryCard({ entry, t }: { entry: KnowledgeEntry; t: PageCopy }) {
  return (
    <article className="space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">{entry.category}</h2>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-white/35">
            <span>{entry.video_count} {t.videosAnalyzed}</span>
            <span>{t.avgDuration}: {entry.avg_duration}{t.seconds}</span>
          </div>
        </div>
      </div>

      {entry.summary && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.045] p-3 text-xs leading-relaxed text-emerald-100/80">
          {entry.summary}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <KnowledgeSection title={t.hooks}>
          {entry.hook_patterns.map((hook, index) => (
            <div key={`${hook.pattern}-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-xs font-semibold text-emerald-300">{hook.pattern}</div>
              <div className="mt-1 text-xs italic text-white/60">&ldquo;{hook.example}&rdquo;</div>
            </div>
          ))}
        </KnowledgeSection>

        <KnowledgeSection title={t.structures}>
          {entry.structure_templates.map((template, templateIndex) => (
            <div key={`${template.name}-${templateIndex}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="mb-2 text-xs font-semibold text-blue-300">{template.name}</div>
              <div className="space-y-1">
                {template.scenes.map((scene, sceneIndex) => (
                  <div key={`${template.name}-${scene.time}-${sceneIndex}`} className="flex gap-2 text-[11px]">
                    <span className="w-10 shrink-0 font-mono text-white/25">{scene.time}</span>
                    <span className="text-white/60">{scene.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </KnowledgeSection>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <PillList title={t.ctas} items={entry.cta_templates} />
        <PillList title={t.tones} items={entry.tone_profiles} />
        <PillList title={t.hashtags} items={entry.top_hashtags.map((tag) => `#${tag}`)} />
      </div>
    </article>
  );
}

function KnowledgeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white/88">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PillList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white/88">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={`${title}-${index}-${item}`} className="rounded-full border border-white/[0.06] bg-white/[0.035] px-3 py-1 text-[11px] text-white/55">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
