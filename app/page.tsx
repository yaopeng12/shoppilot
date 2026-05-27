"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";

const copy = {
  en: {
    badge: "Pet cleaning ad workflow",
    title: "One link to a pet cleaning ad pack",
    desc: "ShopPilot is an integrated production tool for cat-home cleaning, odor control, litter tracking, pet urine cleanup, and fur removal ads. It automatically matches source candidates, selects a niche video template, and generates a complete TikTok-ready ad pack.",
    primary: "Generate Ad Pack",
    secondary: "View template research",
    previewTitle: "Pet Cleaning Ad Pack",
    previewSource: "Auto source score 91",
    previewTemplate: "Guest Smell Check",
    previewItems: [
      ["Source Match", "1688-style candidate ranked by fit, margin, demand, demo value, and compliance safety."],
      ["Creative Strategy", "Cat litter odor angle, guest embarrassment hook, room-reset proof pattern."],
      ["Production Pack", "Hooks, UGC scripts, storyboard, shot list, captions, AI video prompts, and claim guardrails."],
    ],
    metrics: [
      ["1 link", "from product signal to ad pack"],
      ["6 scenes", "pet cleaning scenarios"],
      ["100", "source match score scale"],
    ],
    sectionTitle: "Built only for pet-home cleaning ads",
    sectionDesc:
      "Instead of broad ecommerce copy, the system understands recurring pet-cleaning problems and turns them into video structures that are easier to film, test, and scale.",
    features: [
      {
        title: "Automatic source selection",
        desc: "Scores pet-cleaning source candidates by product fit, demand, supplier quality, margin, video demo potential, and compliance safety.",
      },
      {
        title: "Pet-specific template library",
        desc: "Uses reusable structures for cat litter odor, cat urine accidents, litter tracking, pet hair, fabric odor, and dog pad cleanup.",
      },
      {
        title: "Shoot-ready ad pack",
        desc: "Outputs creative strategy, hooks, UGC scripts, storyboard, shot list, captions, voiceover, AI video prompts, claim safety, and A/B tests.",
      },
    ],
    workflowTitle: "The first-stage workflow",
    workflow: [
      ["Paste", "Add a product, competitor, Shopify, Amazon, or TikTok link."],
      ["Detect", "Identify the pet-cleaning scenario and purchase intent."],
      ["Score", "Auto-rank candidate source products and select the highest overall score."],
      ["Generate", "Build the full Pet Cleaning Ad Pack around the selected template."],
    ],
    scenariosTitle: "Deep pet-cleaning scenarios",
    scenarios: [
      "Cat litter box odor",
      "Cat urine cleanup",
      "Litter tracking",
      "Pet hair on sofa and clothes",
      "Fabric and pet bed odor",
      "Dog pad and floor cleanup",
    ],
    seoTitle: "Why this is harder to copy than a generic AI writer",
    seoPoints: [
      "The product scope is narrow enough to build real pet-cleaning pattern memory.",
      "Source selection, template selection, claim safety, and ad production live in one workflow.",
      "The template library can improve every day from public video structures and performance feedback.",
    ],
    ctaTitle: "Start with one pet-cleaning product link",
    ctaDesc: "The first version already handles automatic scenario detection, source scoring, template matching, and complete ad-pack generation.",
    footer: "Focused AI workflow for pet cleaning commerce.",
  },
  zh: {
    badge: "宠物清洁广告工作流",
    title: "一个链接，生成宠物清洁广告包",
    desc: "ShopPilot 现在定位为宠物清洁赛道的一体化产出工具，专注猫家庭清洁、除味、猫砂带出、猫尿清洁和宠物毛发清理。系统自动匹配候选货源、选择细分视频模板，并生成可用于 TikTok 的完整广告包。",
    primary: "生成广告包",
    secondary: "查看模板研究",
    previewTitle: "Pet Cleaning Ad Pack",
    previewSource: "自动货源评分 91",
    previewTemplate: "客人来访前除味模板",
    previewItems: [
      ["货源匹配", "按匹配度、利润、需求、演示价值和合规安全对 1688 候选货源评分。"],
      ["创意策略", "猫砂盆异味场景，客人来访尴尬开场，房间 reset 证明结构。"],
      ["投放素材包", "Hook、UGC 脚本、分镜、镜头清单、字幕、AI 视频提示词和合规表达。"],
    ],
    metrics: [
      ["1 个链接", "从商品信号到广告包"],
      ["6 类场景", "宠物清洁细分问题"],
      ["100 分", "货源综合评分体系"],
    ],
    sectionTitle: "只为宠物家庭清洁广告而做",
    sectionDesc:
      "它不是泛泛写电商文案，而是理解宠物清洁的高频痛点，把商品、货源、模板和广告产出串成一个可以持续积累的数据工作流。",
    features: [
      {
        title: "自动选择货源",
        desc: "按商品匹配度、需求热度、供应商质量、利润空间、视频演示潜力和合规安全给候选货源评分。",
      },
      {
        title: "宠物清洁模板库",
        desc: "覆盖猫砂盆异味、猫尿事故、猫砂带出、宠物毛发、织物异味、狗狗尿垫地板清洁等结构。",
      },
      {
        title: "完整广告素材包",
        desc: "输出创意策略、Hook、UGC 脚本、分镜、镜头清单、字幕、口播、AI 视频提示词、合规和 A/B 测试。",
      },
    ],
    workflowTitle: "第一阶段主流程",
    workflow: [
      ["粘贴", "输入商品、竞品、Shopify、Amazon 或 TikTok 链接。"],
      ["识别", "判断属于哪个宠物清洁场景和购买意图。"],
      ["评分", "自动排序候选货源，并选择综合评分最高的一项。"],
      ["生成", "基于选中的模板生成完整 Pet Cleaning Ad Pack。"],
    ],
    scenariosTitle: "持续深挖的宠物清洁场景",
    scenarios: ["猫砂盆异味", "猫尿清洁", "猫砂带出", "沙发衣物粘毛", "织物和宠物窝异味", "狗狗尿垫和地板清洁"],
    seoTitle: "为什么它比泛 AI 写作工具更难被复制",
    seoPoints: [
      "范围足够窄，系统可以长期积累宠物清洁广告结构记忆。",
      "货源选择、模板选择、合规表达和广告产出在同一个流程里完成。",
      "模板库可以每天从公开视频结构和投放反馈里持续进化。",
    ],
    ctaTitle: "从一个宠物清洁商品链接开始",
    ctaDesc: "第一阶段已经支持自动场景识别、货源评分、模板匹配和完整广告包生成。",
    footer: "专注宠物清洁电商的一体化 AI 工作流。",
  },
} as const;

export default function ShopPilotLanding() {
  const { data: session } = useSession();
  const { locale } = useI18n();
  const t = copy[locale];
  const user = session?.user;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ShopPilot",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://shoppilot.help",
    description:
      "Pet cleaning ad pack generator for ecommerce teams. Automatically scores source candidates, matches pet cleaning templates, and creates TikTok-ready ad assets.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar isSignedIn={!!user} user={user} />

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-20 lg:pt-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3.5 py-1.5 text-xs text-emerald-100/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {t.badge}
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/58 sm:text-lg">{t.desc}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/storyboard"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                {t.primary}
              </Link>
              <Link
                href="/inspiration"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/[0.12] px-6 text-sm font-semibold text-white/72 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-white"
              >
                {t.secondary}
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {t.metrics.map(([value, label]) => (
                <div key={label} className="border-l border-white/[0.08] pl-4">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-xs leading-5 text-white/42">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.1] bg-[#0a0a0f]/90 shadow-2xl shadow-black/35">
            <div className="border-b border-white/[0.08] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{t.previewTitle}</div>
                  <div className="mt-1 text-xs text-white/35">{t.previewTemplate}</div>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {t.previewSource}
                </div>
              </div>
            </div>
            <div className="space-y-3 p-5">
              {t.previewItems.map(([title, text], index) => (
                <div key={title} className="grid grid-cols-[36px_1fr] gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs text-white/45">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-white/52">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.sectionTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-white/48">{t.sectionDesc}</p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {t.features.map((feature) => (
                <article key={feature.title} className="rounded-2xl border border-white/[0.08] bg-[#08080d] p-5">
                  <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/48">{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.workflowTitle}</h2>
            <div className="mt-6 space-y-4">
              {t.workflow.map(([title, desc], index) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-xs text-white/55">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="mt-1 text-sm leading-6 text-white/48">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{t.scenariosTitle}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.scenarios.map((scenario) => (
                  <span key={scenario} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-xs text-white/60">
                    {scenario}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="text-xl font-semibold">{t.seoTitle}</h2>
              <ul className="mt-4 space-y-3">
                {t.seoPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-white/58">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.ctaTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">{t.ctaDesc}</p>
              </div>
              <Link
                href="/storyboard"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                {t.primary}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <div>ShopPilot</div>
          <div>{t.footer}</div>
          <div>2026 ShopPilot.help</div>
        </div>
      </footer>
    </div>
  );
}
