"use client";

import { cn } from "@/components/ui/cn";
import type { PetAdPack, ScoreBreakdown } from "@/lib/pet-ad-pack/types";

type Labels = {
  autoSource: string;
  score: string;
  why: string;
  sourceSearch: string;
  alternatives: string;
  strategy: string;
  template: string;
  hooks: string;
  scripts: string;
  storyboard: string;
  shotList: string;
  captions: string;
  voiceover: string;
  videoPrompts: string;
  compliance: string;
  testing: string;
  exportJson: string;
  exportMarkdown: string;
  safeClaims: string;
  avoidClaims: string;
  saferPhrases: string;
  localization: string;
  targetMarket: string;
  language: string;
  creatorVoice: string;
  culturalNotes: string;
  ali1688Products: string;
  selectedProduct: string;
  searchLinks: string;
  viewOn1688: string;
  minOrder: string;
  transactions: string;
};

type PetAdPackViewProps = {
  data: PetAdPack;
  labels: Labels;
};

const scoreLabels: Record<keyof ScoreBreakdown, string> = {
  productMatch: "Product match",
  scenarioDemand: "Demand",
  supplierQuality: "Supplier",
  marginPotential: "Margin",
  videoDemoPotential: "Video demo",
  complianceSafety: "Safety",
};

export function PetAdPackView({ data, labels }: PetAdPackViewProps) {
  const source = data.selectedSource;
  const breakdown = source.scoreBreakdown;

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-emerald-200/70">{labels.localization}</div>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-[11px] text-white/35">{labels.targetMarket}</div>
            <div className="mt-1 text-sm font-semibold text-white">{data.localization.label} · {data.localization.targetMarket}</div>
          </div>
          <div>
            <div className="text-[11px] text-white/35">{labels.language}</div>
            <div className="mt-1 text-sm font-semibold text-white">{data.localization.language}</div>
          </div>
          <div>
            <div className="text-[11px] text-white/35">{labels.creatorVoice}</div>
            <div className="mt-1 text-sm font-semibold text-white">{data.localization.localizationLevel}</div>
          </div>
        </div>
        <div className="mt-4 text-xs leading-6 text-emerald-50/70">
          <span className="text-emerald-100/90">{labels.culturalNotes}: </span>
          {data.localization.culturalNotes.join(" / ")}
        </div>
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/15 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-400/12 px-2.5 py-1 font-semibold text-emerald-100">
              Plays strongest: {data.marketPlaybook.primaryMarketLabel}
            </span>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-white/55">
              {data.marketPlaybook.confidence} confidence
            </span>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="text-xs leading-5 text-white/62">
              <span className="block text-white/35">Hook angle</span>
              {data.marketPlaybook.hookAngle}
            </div>
            <div className="text-xs leading-5 text-white/62">
              <span className="block text-white/35">CTA</span>
              {data.marketPlaybook.cta}
            </div>
            <div className="text-xs leading-5 text-white/62">
              <span className="block text-white/35">Why</span>
              {data.marketPlaybook.reason}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-emerald-300/70">{labels.autoSource}</div>
              <h2 className="mt-2 text-xl font-semibold text-white">{source.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">
                {source.productType} / RMB {source.estimatedPriceCny} / Suggested ${source.suggestedRetailUsd}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-center">
              <div className="text-3xl font-bold text-emerald-200">{source.score}</div>
              <div className="text-[11px] text-emerald-100/55">{labels.score}</div>
            </div>
          </div>

          {breakdown && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(Object.entries(breakdown) as Array<[keyof ScoreBreakdown, number]>).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/42">
                    <span>{scoreLabels[key]}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            <div className="mb-2 text-xs text-white/40">{labels.why}</div>
            <div className="flex flex-wrap gap-2">
              {source.reasons.map((reason, index) => (
                <span key={`reason-${index}-${reason}`} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs text-white/58">
                  {reason}
                </span>
              ))}
            </div>
          </div>

          <a
            href={source.searchUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-9 items-center rounded-lg border border-white/[0.1] px-3 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            {labels.sourceSearch}
          </a>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/80 p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-blue-300/70">{labels.template}</div>
          <h3 className="mt-2 text-xl font-semibold">{data.selectedTemplate.name}</h3>
          <p className="mt-2 text-sm leading-6 text-white/50">{data.selectedTemplate.format}</p>
          <div className="mt-4 space-y-2">
            {data.selectedTemplate.structure.map((step, index) => (
              <div key={`structure-${index}-${step}`} className="grid grid-cols-[28px_1fr] gap-3 text-sm text-white/62">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-[11px] text-white/45">
                  {index + 1}
                </span>
                <span className="leading-6">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Section title={labels.strategy}>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.strategy).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-white/30">{key.replace(/([A-Z])/g, " $1")}</div>
              <p className="text-sm leading-6 text-white/68">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={labels.hooks}>
        <div className="grid gap-3 md:grid-cols-2">
          {data.hooks.map((hook, index) => (
            <div key={`hook-${index}-${hook}`} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="mb-2 text-xs font-semibold text-emerald-300">Hook {index + 1}</div>
              <p className="text-sm leading-6 text-white/72">{hook}</p>
            </div>
          ))}
        </div>
      </Section>

      {data.creativeVariants && data.creativeVariants.length > 0 && (
        <Section title="Creative Variants">
          <div className="grid gap-3 md:grid-cols-3">
            {data.creativeVariants.map((variant) => (
              <div key={variant.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="text-xs font-semibold text-blue-200">{variant.angle}</div>
                <p className="mt-2 text-sm leading-6 text-white/70">{variant.hook}</p>
                <div className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-5 text-white/42">
                  <div>First shot: {variant.firstShot}</div>
                  <div className="mt-1">CTA: {variant.cta}</div>
                  <div className="mt-1 text-emerald-200/65">{variant.bestFor}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title={labels.scripts}>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.scripts.map((script) => (
            <article key={script.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold">{script.name}</h3>
                    <p className="mt-1 text-xs text-white/35">{script.duration} / {script.tone}</p>
                  </div>
                  <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-200">{script.id}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">&ldquo;{script.hook}&rdquo;</p>
              </div>
              <div className="space-y-3 p-5">
                {script.scenes.map((scene, sceneIndex) => (
                  <SceneRow key={`${script.id}-${scene.time}-${sceneIndex}`} scene={scene} />
                ))}
                <div className="rounded-xl bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-100/75">
                  CTA: {script.cta}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={labels.storyboard}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.storyboard.map((scene, index) => (
            <SceneRow key={`storyboard-${index}-${scene.time}-${scene.overlay}`} scene={scene} compact />
          ))}
        </div>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <ListSection title={labels.shotList} items={data.shotList} />
        <ListSection title={labels.captions} items={data.captions} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title={labels.voiceover}>
          <p className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-sm leading-7 text-white/68">
            {data.voiceover}
          </p>
        </Section>
        <ListSection title={labels.videoPrompts} items={data.aiVideoPrompts} />
      </div>

      <Section title={labels.compliance}>
        <div className="grid gap-4 md:grid-cols-3">
          <ClaimList title={labels.safeClaims} items={data.compliance.safeClaims} tone="safe" />
          <ClaimList title={labels.avoidClaims} items={data.compliance.avoidClaims} tone="avoid" />
          <ClaimList title={labels.saferPhrases} items={data.compliance.saferPhrases} tone="neutral" />
        </div>
      </Section>

      <Section title={labels.testing}>
        <div className="grid gap-3 md:grid-cols-3">
          {data.testingPlan.map((test, index) => (
            <div key={`${test.variant}-${index}`} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="text-sm font-semibold text-white">Variant {test.variant}</div>
              <p className="mt-2 text-sm leading-6 text-white/60">{test.change}</p>
              <p className="mt-3 text-xs text-blue-200/70">{test.successMetric}</p>
            </div>
          ))}
        </div>
      </Section>

      {data.ali1688 && (
        <Section title={labels.ali1688Products}>
          {/* Selected product */}
          {data.ali1688.selectedProduct && (
            <div className="mb-5 rounded-2xl border border-orange-400/20 bg-orange-400/[0.04] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-orange-300/70">{labels.selectedProduct}</div>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">{data.ali1688.selectedProduct.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/55">
                    <span className="text-orange-200 font-semibold">¥{data.ali1688.selectedProduct.price}</span>
                    <span>/</span>
                    <span>{data.ali1688.selectedProduct.unit}</span>
                    <span>/</span>
                    <span>{labels.minOrder}: {data.ali1688.selectedProduct.minOrder}</span>
                  </div>
                  <div className="mt-2 text-xs text-white/40">
                    {data.ali1688.selectedProduct.supplier} · {data.ali1688.selectedProduct.supplierLocation}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <SourcingMetric label="Match" value={String(data.ali1688.selectedProduct.matchScore ?? "-")} />
                    <SourcingMetric label="Retail" value={`$${data.ali1688.selectedProduct.suggestedRetailUsd}`} />
                    <SourcingMetric label="Margin" value={`${data.ali1688.selectedProduct.grossMarginPercent}%`} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
                    <span>★ {data.ali1688.selectedProduct.supplierRating.toFixed(1)}</span>
                    <span>{labels.transactions}: {data.ali1688.selectedProduct.transactionCount >= 10000
                      ? `${(data.ali1688.selectedProduct.transactionCount / 10000).toFixed(1)}万`
                      : data.ali1688.selectedProduct.transactionCount >= 1000
                        ? `${(data.ali1688.selectedProduct.transactionCount / 1000).toFixed(1)}千`
                        : data.ali1688.selectedProduct.transactionCount}</span>
                  </div>
                  {data.ali1688.selectedProduct.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {data.ali1688.selectedProduct.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-0.5 text-[11px] text-white/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-orange-300/15 bg-orange-300/[0.06] px-2.5 py-0.5 text-[11px] text-orange-100/65">
                      Risk: {data.ali1688.selectedProduct.riskLevel}
                    </span>
                    {data.ali1688.selectedProduct.matchReasons?.slice(0, 3).map((reason) => (
                      <span key={reason} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-0.5 text-[11px] text-white/50">
                        {reason}
                      </span>
                    ))}
                  </div>
                  {data.ali1688.selectedProduct.sourcingTips.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-xs leading-5 text-white/45">
                      {data.ali1688.selectedProduct.sourcingTips.slice(0, 3).map((tip) => (
                        <li key={tip}>- {tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <a
                  href={data.ali1688.selectedProduct.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 shrink-0 items-center rounded-lg bg-orange-500/20 px-4 text-xs font-medium text-orange-200 transition hover:bg-orange-500/30"
                >
                  {labels.viewOn1688}
                </a>
              </div>
            </div>
          )}

          {/* Alternative products */}
          {data.ali1688.products.length > 1 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.ali1688.products.filter(p => p.id !== data.ali1688?.selectedProduct?.id).map((product) => (
                <div key={product.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <h4 className="text-sm font-medium text-white/80 line-clamp-2">{product.title}</h4>
                  <div className="mt-2 flex items-center gap-2 text-xs text-white/45">
                    <span className="text-orange-200/80 font-semibold">¥{product.price}</span>
                    <span>·</span>
                    <span>★ {product.supplierRating.toFixed(1)}</span>
                    <span>·</span>
                    <span>{product.transactionCount >= 10000
                      ? `${(product.transactionCount / 10000).toFixed(1)}万`
                      : product.transactionCount >= 1000
                        ? `${(product.transactionCount / 1000).toFixed(1)}千`
                        : product.transactionCount}笔</span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-white/30">{product.supplier}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-white/40">
                    <span>Match {product.matchScore ?? "-"}</span>
                    <span>/</span>
                    <span>Margin {product.grossMarginPercent}%</span>
                    <span>/</span>
                    <span>Risk {product.riskLevel}</span>
                  </div>
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-xs text-orange-300/60 hover:text-orange-300 transition"
                  >
                    {labels.viewOn1688} →
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Search links */}
          {data.ali1688.searchUrls.length > 0 && (
            <div className="mt-5">
              <div className="mb-3 text-xs text-white/40">{labels.searchLinks}</div>
              <div className="flex flex-wrap gap-2">
                {data.ali1688.searchUrls.map(({ keyword, url }) => (
                  <a
                    key={keyword}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    {keyword}
                  </a>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      <div className="flex flex-wrap gap-3">
        <ExportButton data={data} format="json" label={labels.exportJson} />
        <ExportButton data={data} format="markdown" label={labels.exportMarkdown} />
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-white">{title}</h2>
      {children}
    </div>
  );
}

function SourcingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.12em] text-white/30">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/78">{value}</div>
    </div>
  );
}

function SceneRow({ scene, compact = false }: { scene: PetAdPack["storyboard"][number]; compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.07] bg-white/[0.025]",
        compact ? "p-4" : "grid gap-3 p-4 sm:grid-cols-[74px_1fr]",
      )}
    >
      <div className={cn("font-mono text-xs text-blue-300", compact && "mb-2")}>{scene.time}</div>
      <div>
        <div className="mb-1 text-xs uppercase tracking-[0.14em] text-white/30">{scene.objective}</div>
        <p className="text-sm leading-6 text-white/70">{scene.visual}</p>
        <p className="mt-2 text-xs text-emerald-200/70">{scene.overlay}</p>
        <p className="mt-1 text-xs leading-5 text-white/42">{scene.narration}</p>
      </div>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Section title={title}>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${title}-${index}-${item}`} className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-white/65">
            <span className="font-mono text-xs text-white/28">{String(index + 1).padStart(2, "0")}</span>
            <span className="leading-6">{item}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ClaimList({ title, items, tone }: { title: string; items: string[]; tone: "safe" | "avoid" | "neutral" }) {
  const toneClass =
    tone === "safe"
      ? "border-emerald-400/15 bg-emerald-400/[0.045] text-emerald-100/72"
      : tone === "avoid"
        ? "border-rose-400/15 bg-rose-400/[0.045] text-rose-100/72"
        : "border-blue-400/15 bg-blue-400/[0.045] text-blue-100/72";

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item, index) => (
          <li key={`${title}-${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ExportButton({ data, format, label }: { data: PetAdPack; format: "json" | "markdown"; label: string }) {
  function handleExport() {
    const content = format === "json" ? JSON.stringify(data, null, 2) : buildMarkdown(data);
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pet-cleaning-ad-pack.${format === "json" ? "json" : "md"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="h-10 rounded-lg border border-white/[0.1] px-4 text-xs font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
    >
      {label}
    </button>
  );
}

function buildMarkdown(data: PetAdPack) {
  const lines = [
    "# Pet Cleaning Ad Pack",
    "",
    `Product: ${data.product.title}`,
    `Target market: ${data.localization.label} (${data.localization.targetMarket})`,
    `Localization: ${data.localization.localizationLevel}`,
    `Top play market: ${data.marketPlaybook.primaryMarketLabel} (${data.marketPlaybook.confidence})`,
    `Market tactic: ${data.marketPlaybook.hookAngle}`,
    `Selected source: ${data.selectedSource.title} (${data.selectedSource.score}/100)`,
    `Template: ${data.selectedTemplate.name}`,
    "",
    "## Strategy",
    "",
    ...Object.entries(data.strategy).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Hooks",
    "",
    ...data.hooks.map((hook) => `- ${hook}`),
    "",
    "## Scripts",
    "",
  ];

  for (const script of data.scripts) {
    lines.push(`### ${script.name}`);
    lines.push(`Hook: ${script.hook}`);
    for (const scene of script.scenes) {
      lines.push(`- ${scene.time}: ${scene.visual} | ${scene.overlay} | ${scene.narration}`);
    }
    lines.push(`CTA: ${script.cta}`);
    lines.push("");
  }

  lines.push("## Compliance");
  lines.push("");
  lines.push(...data.compliance.avoidClaims.map((claim) => `- Avoid: ${claim}`));

  return lines.join("\n");
}
