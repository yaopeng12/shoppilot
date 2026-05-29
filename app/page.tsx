"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";

const copy = {
  en: {
    badge: "Pet cleaning ad workflow",
    title: "Turn one product link into a sourcing-backed ad pack",
    desc: "ShopPilot reads a pet-cleaning product or competitor link, scores the best 1688 sourcing direction, matches a reusable short-video template, and outputs hooks, scripts, storyboard, shooting list, captions, claims, and test variants.",
    primary: "Generate Ad Pack",
    secondary: "View Templates",
    proof: ["1688 match", "Template fit", "3 creative variants", "Shoot-ready brief"],
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
    sectionTitle: "Built for people who need ads they can actually make",
    sectionDesc:
      "Generic AI writers stop at copy. ShopPilot ties product signal, sourcing logic, template fit, and production detail into one pet-cleaning workflow.",
    features: [
      ["Sourcing decision card", "See match score, expected margin, risk flags, sample-order tips, and precise 1688 search terms."],
      ["Template memory", "Use proven structures for cat litter odor, urine cleanup, tracking, pet hair, fabric odor, paw cleanup, and more."],
      ["Creative variants", "Generate multiple angles for testing instead of betting on one script."],
      ["Production brief", "Turn strategy into first shot, scene timing, overlay, narration, CTA, and shot list."],
    ],
    workflowTitle: "From link to launch material",
    workflow: [
      ["Paste link", "Use a Shopify, Amazon, TikTok, marketplace, or competitor page."],
      ["Score product direction", "Detect the cleaning scenario and rank sourcing candidates by fit, demand, margin, demo value, and safety."],
      ["Match creative structure", "Pick a pet-cleaning template and localize the voice for the target market."],
      ["Export the ad pack", "Use scripts, storyboard, captions, AI video prompts, claim guardrails, and test variants."],
    ],
    scenariosTitle: "Pet-cleaning scenarios with real pattern memory",
    scenarios: ["Cat litter odor", "Cat urine cleanup", "Litter tracking", "Pet hair removal", "Fabric odor", "Dog pad floor", "Paw cleanup", "Pet stain removal"],
    ctaTitle: "Try it with one pet-cleaning product link",
    ctaDesc: "The sharper the product signal, the better the sourcing card, template match, and creative variants become.",
    contactTitle: "Have feedback or a sourcing request?",
    contactDesc: "Tell us what product category, market, or workflow detail you want ShopPilot to support next.",
    contactEmail: "mason@shoppilot.help",
    contactCta: "Email us",
    footer: "Focused AI workflow for pet cleaning commerce.",
  },
  zh: {
    badge: "宠物清洁广告工作流",
    title: "一个商品链接，生成带货源判断的广告包",
    desc: "ShopPilot 会读取宠物清洁商品或竞品链接，判断细分场景，给出 1688 采购方向和匹配分，再匹配短视频模板，输出 Hook、脚本、分镜、拍摄清单、字幕、合规表达和测试变体。",
    primary: "生成广告包",
    secondary: "查看模板库",
    proof: ["1688 匹配", "模板适配", "3 组创意变体", "可拍摄 Brief"],
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
    sectionTitle: "为真正要拍、要测、要投放的人设计",
    sectionDesc:
      "普通 AI 文案工具只给文字。ShopPilot 把商品信号、货源逻辑、模板适配和拍摄细节串成一个宠物清洁广告工作流。",
    features: [
      ["采购决策卡", "展示匹配分、预估毛利、风险点、拿样建议和精准 1688 搜索词。"],
      ["模板记忆", "覆盖猫砂异味、猫尿清洁、猫砂带出、宠物毛发、织物异味、脚掌清洁等结构。"],
      ["创意变体", "一次生成多个测试角度，而不是只押一个脚本。"],
      ["拍摄 Brief", "把策略落成首镜头、时间轴、字幕、口播、CTA 和镜头清单。"],
    ],
    workflowTitle: "从链接到可投放素材",
    workflow: [
      ["粘贴链接", "支持 Shopify、Amazon、TikTok、平台商品页或竞品链接。"],
      ["判断方向", "识别清洁场景，并按匹配度、需求、毛利、演示价值和合规安全给货源排序。"],
      ["匹配结构", "选择宠物清洁模板，并按目标市场本地化语气。"],
      ["导出广告包", "得到脚本、分镜、字幕、AI 视频提示词、合规边界和测试变体。"],
    ],
    scenariosTitle: "持续积累的宠物清洁细分场景",
    scenarios: ["猫砂盆异味", "猫尿清洁", "猫砂带出", "宠物除毛", "织物异味", "狗尿垫地板", "脚掌清洁", "宠物污渍"],
    ctaTitle: "用一个宠物清洁商品链接试试",
    ctaDesc: "商品信号越清楚，采购卡、模板匹配和创意变体就越准。",
    contactTitle: "有反馈或想支持的新货品方向？",
    contactDesc: "告诉我们你希望 ShopPilot 优化的品类、市场、1688 匹配或广告包细节。",
    contactEmail: "mason@shoppilot.help",
    contactCta: "发送邮件",
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
    description: "Pet cleaning ad pack generator with sourcing match, template selection, scripts, storyboard, and claim-safe creative.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90" href="/storyboard">
                {t.primary}
              </Link>
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
              <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90" href="/storyboard">
                {t.primary}
              </Link>
            </div>
          </div>
        </section>

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
