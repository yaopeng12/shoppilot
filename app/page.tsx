"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";

const copy = {
  en: {
    badge: "TikTok UGC Ad Generator for Pet Dropshipping",
    title: "AI TikTok UGC Ad Generator — Turn Product Links into Winning Pet Ads",
    desc: "ShopPilot is the AI tool for Shopify pet stores and dropshipping sellers. Paste a cat litter or pet cleaning product link to generate TikTok UGC ad scripts, 1688 sourcing match, storyboard, captions, and winning product creatives.",
    primary: "Start Free — Generate Ad Pack",
    secondary: "View Templates",
    primaryMicrocopy: "No credit card required · 3 free packs/day · Ready in 60s",
    proof: ["TikTok UGC scripts", "1688 sourcing match", "Cat litter ad templates", "Shopify-ready creatives"],
    inputLabel: "Input",
    input: "cat litter smell remover spray",
    stageTitle: "Live workflow preview",
    stages: [
      ["Detect", "Cat litter odor", "Scenario confidence 92"],
      ["Source", "Litter deodorizer beads", "Match 88 / Margin 78%"],
      ["Template", "Guest Smell Check", "POV + room reset + close-up proof"],
      ["Produce", "15s + 25s UGC pack", "Hooks, storyboard, SRT-ready captions"],
    ],
    sourcePanel: {
      title: "Best sourcing direction",
      product: "Cat litter deodorizer beads",
      score: "88",
      margin: "78%",
      risk: "Medium",
      tips: ["Low MOQ sample path", "Ask supplier for demo clips", "Avoid permanent odor claims"],
    },
    variants: [
      ["Pain Proof", "Guest is coming over and the litter area still smells wrong."],
      ["Fast Demo", "Watch this five-second litter box reset."],
      ["Trust Check", "What I would compare before switching products."],
    ],
    sectionTitle: "AI Ad Tool Built for Shopify Pet Stores & Dropshipping Sellers",
    sectionDesc:
      "Generic AI writers stop at copy. ShopPilot is the TikTok UGC ad generator that ties product signal, 1688 sourcing logic, cat litter ad templates, and production detail into one winning product workflow.",
    features: [
      ["1688 sourcing decision card", "See match score, expected margin, risk flags, sample-order tips, and precise 1688 search terms for pet dropshipping winning products."],
      ["Cat litter ad templates", "Use proven TikTok UGC structures for cat litter odor, urine cleanup, tracking, pet hair, fabric odor, paw cleanup, and more."],
      ["Winning product creatives", "Generate multiple TikTok ad angles for testing instead of betting on one script."],
      ["Production brief", "Turn strategy into first shot, scene timing, overlay, narration, CTA, and shoot-ready TikTok UGC brief."],
    ],
    workflowTitle: "From Shopify Link to TikTok UGC Ad Pack",
    workflow: [
      ["Paste Shopify or product link", "Use a Shopify, Amazon, TikTok Shop, marketplace, or competitor page."],
      ["AI scores sourcing direction", "Detect the pet cleaning scenario and rank 1688 sourcing candidates by fit, demand, margin, demo value, and safety."],
      ["Match TikTok UGC template", "Pick a cat litter ad template or pet cleaning structure and localize for your target market."],
      ["Export winning ad pack", "Get TikTok UGC scripts, storyboard, captions, AI video prompts, claim guardrails, and test variants."],
    ],
    scenariosTitle: "Pet dropshipping winning product scenarios",
    scenarios: ["Cat litter odor", "Cat urine cleanup", "Litter tracking", "Pet hair removal", "Fabric odor", "Dog pad floor", "Paw cleanup", "Pet stain removal"],
    ctaTitle: "Try the AI TikTok UGC Ad Generator with One Product Link",
    ctaDesc: "Paste a Shopify pet store product link or any pet cleaning item. The sharper the signal, the better the 1688 sourcing card, cat litter ad template match, and winning product creatives.",
    faqTitle: "Frequently asked questions",
    faqDesc: "Quick answers about ShopPilot — the AI tool for Shopify pet stores",
    faqItems: [
      { q: "What product links does ShopPilot support?", a: "ShopPilot works with Shopify, Amazon, TikTok Shop, 1688, and most marketplace product pages. Paste any link and we'll extract the product signal." },
      { q: "How accurate is the sourcing match?", a: "The 1688 match score is based on category fit, historical demand, margin estimation, and sample-path viability. Scores above 75 typically indicate a strong sourcing direction." },
      { q: "Can I use this for non-pet products?", a: "ShopPilot is currently optimized for pet-cleaning products. We're expanding to adjacent categories—tell us what you need via the feedback form." },
      { q: "What do I get in the ad pack?", a: "Each pack includes: hook options, full script, storyboard, shot list, SRT captions, AI video prompts, compliance-safe claim alternatives, and 3 creative test variants." },
      { q: "Is there a free trial?", a: "Yes. Free plan includes 3 ad pack generations per day with full sourcing cards and template matching." },
    ],
    contactTitle: "Have feedback or a sourcing request?",
    contactDesc: "Tell us what product category, market, or workflow detail you want ShopPilot to support next.",
    contactEmail: "mason@shoppilot.help",
    contactCta: "Email us",
    footer: "AI-powered TikTok UGC ad generator for pet dropshipping and Shopify stores.",
  },
  zh: {
    badge: "TikTok UGC 广告生成器 · 宠物 Dropshipping",
    title: "AI TikTok UGC 广告生成器 — 商品链接变宠物爆款广告",
    desc: "ShopPilot 是 Shopify 宠物店铺和 Dropshipping 卖家的 AI 广告工具。粘贴猫砂或宠物清洁商品链接，即可生成 TikTok UGC 广告脚本、1688 货源匹配、分镜、字幕和爆款产品素材。",
    primary: "免费生成 TikTok 广告包",
    secondary: "查看模板库",
    primaryMicrocopy: "无需信用卡 · 每天 3 次免费生成 · 60 秒出结果",
    proof: ["TikTok UGC 脚本", "1688 货源匹配", "猫砂广告模板", "Shopify 可用素材"],
    inputLabel: "输入信号",
    input: "猫砂盆除臭喷雾 / 多猫家庭 / 美国市场",
    stageTitle: "工作流动态预览",
    stages: [
      ["识别", "猫砂盆异味", "场景置信度 92"],
      ["选货", "猫砂除臭颗粒", "匹配 88 / 毛利 78%"],
      ["套模板", "客人来访前除味", "POV + 房间 reset + 近景证明"],
      ["产出", "15s + 25s UGC 包", "Hook、分镜、字幕、拍摄清单"],
    ],
    sourcePanel: {
      title: "最佳采购方向",
      product: "猫砂盆除臭颗粒",
      score: "88",
      margin: "78%",
      risk: "中",
      tips: ["适合低 MOQ 拿样", "先向供应商要实拍素材", "避免永久除味类夸大表达"],
    },
    variants: [
      ["痛点证明", "客人快到了，但猫砂盆区域还是有味道。"],
      ["快速演示", "看这个 5 秒猫砂盆 reset 过程。"],
      ["信任测评", "换产品前，我会先看这几个点。"],
    ],
    sectionTitle: "为 Shopify 宠物店铺和 Dropshipping 卖家打造的 AI 广告工具",
    sectionDesc:
      "普通 AI 文案工具只给文字。ShopPilot 是 TikTok UGC 广告生成器，把商品信号、1688 货源逻辑、猫砂广告模板和拍摄细节串成一个爆款产品工作流。",
    features: [
      ["1688 货源决策卡", "展示匹配分、预估毛利、风险点、拿样建议和精准搜索词，助你找到宠物 Dropshipping 爆款。"],
      ["猫砂广告模板", "覆盖猫砂异味、猫尿清洁、猫砂带出、宠物毛发、织物异味、脚掌清洁等 TikTok UGC 结构。"],
      ["爆款产品创意", "一次生成多个 TikTok 广告测试角度，而不是只押一个脚本。"],
      ["拍摄 Brief", "把策略落成首镜头、时间轴、字幕、口播、CTA 和可拍摄的 TikTok UGC 清单。"],
    ],
    workflowTitle: "从 Shopify 链接到 TikTok UGC 广告包",
    workflow: [
      ["粘贴 Shopify 或商品链接", "支持 Shopify、Amazon、TikTok Shop、平台商品页或竞品链接。"],
      ["AI 评分货源方向", "识别宠物清洁场景，按匹配度、需求、毛利、演示价值和合规安全给 1688 货源排序。"],
      ["匹配 TikTok UGC 模板", "选择猫砂广告模板或宠物清洁结构，并按目标市场本地化语气。"],
      ["导出爆款广告包", "得到 TikTok UGC 脚本、分镜、字幕、AI 视频提示词、合规边界和测试变体。"],
    ],
    scenariosTitle: "宠物 Dropshipping 爆款产品场景",
    scenarios: ["猫砂盆异味", "猫尿清洁", "猫砂带出", "宠物除毛", "织物异味", "狗尿垫地板", "脚掌清洁", "宠物污渍"],
    ctaTitle: "用一个商品链接试试 AI TikTok UGC 广告生成器",
    ctaDesc: "粘贴 Shopify 宠物店铺商品链接或任意宠物清洁产品。信号越清楚，1688 货源卡、猫砂广告模板匹配和爆款产品创意就越准。",
    faqTitle: "常见问题",
    faqDesc: "关于 ShopPilot — Shopify 宠物店铺 AI 工具的快速解答",
    faqItems: [
      { q: "ShopPilot 支持哪些商品链接？", a: "支持 Shopify、Amazon、TikTok Shop、1688 以及大多数电商平台的商品页。粘贴任意链接，我们会自动提取商品信号。" },
      { q: "货源匹配的准确度如何？", a: "1688 匹配分基于品类契合度、历史需求、毛利估算和拿样可行性综合计算。75 分以上通常代表较强的采购方向。" },
      { q: "可以用于非宠物产品吗？", a: "ShopPilot 目前专注于宠物清洁品类。我们正在向相邻品类扩展——通过反馈表告诉我们你的需求。" },
      { q: "广告包包含哪些内容？", a: "每个广告包包含：Hook 选项、完整脚本、分镜、镜头清单、SRT 字幕、AI 视频提示词、合规表达替代方案，以及 3 组创意测试变体。" },
      { q: "有免费试用吗？", a: "有。免费计划每天可生成 3 个广告包，包含完整的采购卡和模板匹配功能。" },
    ],
    contactTitle: "有反馈或想支持的新货品方向？",
    contactDesc: "告诉我们你希望 ShopPilot 优化的品类、市场、1688 匹配或广告包细节。",
    contactEmail: "mason@shoppilot.help",
    contactCta: "发送邮件",
    footer: "AI 驱动的 TikTok UGC 广告生成器，服务宠物 Dropshipping 和 Shopify 店铺。",
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
    name: "ShopPilot - TikTok UGC Ad Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://shoppilot.help",
    description: "AI-powered TikTok UGC ad generator for pet dropshipping and Shopify stores. Create cat litter ad scripts, 1688 sourcing match, storyboard, and winning product creatives.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar isSignedIn={!!user} user={user} />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-10 sm:px-6 lg:grid-cols-[0.93fr_1.07fr] lg:items-center lg:pb-20 lg:pt-14">
          <div className="animate-fade-in-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3.5 py-1.5 text-xs text-emerald-100/75">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse-glow" />
              {t.badge}
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/58">{t.desc}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90" href="/storyboard">
                  {t.primary}
                </Link>
                <p className="mt-2.5 text-xs text-white/40">{t.primaryMicrocopy}</p>
              </div>
              <Link className="inline-flex h-12 items-center justify-center rounded-xl border border-white/[0.12] px-6 text-sm font-semibold text-white/72 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-white" href="/inspiration">
                {t.secondary}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {t.proof.map((item) => (
                <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-white/55">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <HeroConsole t={t} />
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.sectionTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-white/48">{t.sectionDesc}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {t.features.map(([title, desc], index) => (
                  <article key={title} className="group rounded-2xl border border-white/[0.08] bg-[#08080d] p-5 transition hover:border-white/[0.16] hover:bg-white/[0.04]" style={{ animationDelay: `${index * 0.08}s` }}>
                    <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-500 group-hover:w-full" style={{ width: `${58 + index * 10}%` }} />
                    </div>
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/48">{desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.workflowTitle}</h2>
            <div className="mt-6 space-y-4">
              {t.workflow.map(([title, desc], index) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
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
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="text-xl font-semibold">{t.scenariosTitle}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.scenarios.map((scenario, index) => (
                  <span key={scenario} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-xs text-white/60" style={{ animationDelay: `${index * 0.05}s` }}>
                    {scenario}
                  </span>
                ))}
              </div>
            </div>
            <VariantRail variants={t.variants} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.ctaTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">{t.ctaDesc}</p>
              </div>
              <div className="text-center lg:text-right">
                <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90" href="/storyboard">
                  {t.primary}
                </Link>
                <p className="mt-2.5 text-xs text-white/40">{t.primaryMicrocopy}</p>
              </div>
            </div>
          </div>
        </section>

        <FaqSection t={t} />

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6">
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.045] p-6 sm:p-8">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{t.contactTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/52">{t.contactDesc}</p>
                <p className="mt-3 text-sm font-medium text-emerald-100/80">{t.contactEmail}</p>
              </div>
              <a
                href={`mailto:${t.contactEmail}?subject=${encodeURIComponent("ShopPilot feedback")}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-200/20 bg-emerald-300/10 px-5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/16"
              >
                {t.contactCta}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>ShopPilot</div>
          <div>{t.footer}</div>
          <div>2026 ShopPilot.help</div>
        </div>
      </footer>
    </div>
  );
}

function HeroConsole({ t }: { t: (typeof copy)["en"] | (typeof copy)["zh"] }) {
  return (
    <div className="animate-fade-in-up delay-100">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#08080d] shadow-2xl shadow-black/35">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent animate-home-scan" />
        <div className="border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">{t.stageTitle}</div>
              <div className="mt-1 text-xs text-white/35">{t.inputLabel}: {t.input}</div>
            </div>
            <div className="hidden h-8 items-center rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 text-xs text-emerald-100/70 sm:inline-flex">
              scoring
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            {t.stages.map(([label, title, detail], index) => (
              <div key={label} className="relative grid grid-cols-[72px_1fr] gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-white/45">{detail}</div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-home-meter" style={{ animationDelay: `${index * 0.22}s` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-orange-300/15 bg-orange-300/[0.045] p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-orange-200/70">{t.sourcePanel.title}</div>
            <div className="mt-3 text-base font-semibold text-white">{t.sourcePanel.product}</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniMetric label="Match" value={t.sourcePanel.score} />
              <MiniMetric label="Margin" value={t.sourcePanel.margin} />
              <MiniMetric label="Risk" value={t.sourcePanel.risk} />
            </div>
            <div className="mt-4 space-y-2">
              {t.sourcePanel.tips.map((tip) => (
                <div key={tip} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs leading-5 text-white/55">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-[0.12em] text-white/30">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/80">{value}</div>
    </div>
  );
}

function VariantRail({ variants }: { variants: readonly (readonly [string, string])[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08080d] p-5">
      <div className="mb-4 text-xs uppercase tracking-[0.16em] text-blue-200/70">Creative variants</div>
      <div className="space-y-3">
        {variants.map(([title, hook], index) => (
          <div key={title} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 animate-fade-in-up" style={{ animationDelay: `${index * 0.12}s` }}>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="rounded-full bg-blue-400/10 px-2.5 py-1 text-[11px] text-blue-100/70">A/{index + 1}</div>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/55">{hook}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqSection({ t }: { t: (typeof copy)["en"] | (typeof copy)["zh"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
      <div className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.faqTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-white/48">{t.faqDesc}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {t.faqItems.map((item, index) => (
          <div
            key={item.q}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.14]"
          >
            <button
              className="flex w-full items-center gap-4 px-6 py-5 text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              <span className="flex-1 text-sm font-semibold text-white">{item.q}</span>
              <svg
                className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-white/[0.06] px-6 pb-5 pt-4">
                <p className="text-sm leading-7 text-white/50">{item.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
