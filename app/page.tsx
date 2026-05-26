"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";

const copy = {
  en: {
    badge: "AI video workflow for ecommerce teams",
    title: "Turn product links into vertical video plans",
    desc: "ShopPilot helps Shopify sellers move from product page to TikTok-ready storyboard, hook, script, narration, and production notes for niche-specific short videos.",
    primary: "Generate a storyboard",
    secondary: "Create ad copy",
    previewTitle: "Storyboard brief",
    previewMeta: "Beauty and skincare · 30s TikTok",
    previewProduct: "Hydrating face cream",
    scenes: [
      { time: "0-3s", label: "Hook", text: "Close-up texture shot with a routine pain point." },
      { time: "3-9s", label: "Proof", text: "Show application, finish, and believable social proof." },
      { time: "9-20s", label: "Demo", text: "Break down usage in creator-style vertical shots." },
      { time: "20-30s", label: "CTA", text: "End with a low-friction routine upgrade angle." },
    ],
    metrics: [
      ["30s", "structured video plan"],
      ["8", "vertical domains"],
      ["5+", "creative assets per run"],
    ],
    sectionTitle: "Built for vertical commerce video",
    sectionDesc: "Instead of generic copy, each generation adapts the message, proof pattern, and camera language to the product category.",
    features: [
      { title: "Vertical-domain strategy", desc: "Choose beauty, fashion, home, fitness, electronics, parenting, and more. Each domain has its own audience, pain points, compliance notes, and visual language." },
      { title: "Scene-by-scene storyboard", desc: "Get timing, shot direction, narration, overlay text, camera movement, transitions, and production notes in one structured output." },
      { title: "Ad creative toolkit", desc: "Generate hooks, TikTok scripts, voiceovers, subtitles, and exportable copy from a Shopify product URL." },
    ],
    workflowTitle: "From product page to shoot-ready concept",
    workflow: [
      ["Paste", "Drop in a Shopify product URL."],
      ["Choose", "Select the vertical and creative angle."],
      ["Generate", "Get storyboard and creative assets."],
      ["Publish", "Film, edit, test, and iterate faster."],
    ],
    domainsTitle: "Niches covered",
    domains: ["Beauty", "Fashion", "Home", "Pet", "Fitness", "Electronics", "Parenting", "General ecommerce"],
    seoTitle: "Why this helps organic and paid growth",
    seoPoints: [
      "Turns product detail pages into repeatable video assets.",
      "Keeps claims realistic with category-specific compliance prompts.",
      "Creates consistent hooks, narration, and overlays for rapid creative testing.",
    ],
    ctaTitle: "Build your next vertical video brief",
    ctaDesc: "Start with a product link, then shape the output around the niche and creative angle you actually want to test.",
    footer: "AI copilot for ecommerce video creative.",
  },
  zh: {
    badge: "面向电商团队的 AI 短视频工作流",
    title: "把商品链接变成垂直视频方案",
    desc: "ShopPilot 帮 Shopify 卖家从商品页快速生成 TikTok 分镜、Hook、脚本、旁白和拍摄提示，让不同垂直领域的视频创意更容易落地。",
    primary: "生成视频分镜",
    secondary: "生成广告文案",
    previewTitle: "分镜简报",
    previewMeta: "美妆护肤 · 30 秒 TikTok",
    previewProduct: "保湿修护面霜",
    scenes: [
      { time: "0-3s", label: "开头", text: "用质地特写切入一个真实的护肤痛点。" },
      { time: "3-9s", label: "证明", text: "展示上脸过程、即时妆效和可信的社交证明。" },
      { time: "9-20s", label: "演示", text: "用创作者风格的竖屏镜头拆解使用流程。" },
      { time: "20-30s", label: "转化", text: "用低门槛的日常升级角度收尾。" },
    ],
    metrics: [
      ["30 秒", "结构化视频方案"],
      ["8 个", "垂直领域"],
      ["5+", "单次生成创意资产"],
    ],
    sectionTitle: "为垂直电商短视频设计",
    sectionDesc: "它不是泛泛写文案，而是按品类调整信息重点、证明方式和镜头语言。",
    features: [
      { title: "垂直领域策略", desc: "支持美妆、服饰、家居、健身、消费电子、母婴等领域，每个领域都有对应人群、痛点、合规提示和视觉语言。" },
      { title: "逐镜头视频分镜", desc: "一次拿到时间轴、画面描述、旁白、字幕、镜头运动、转场和拍摄提示，直接进入拍摄准备。" },
      { title: "广告创意工具箱", desc: "从 Shopify 商品链接生成 Hook、TikTok 脚本、配音文案、字幕和可复制的广告内容。" },
    ],
    workflowTitle: "从商品页到可拍摄方案",
    workflow: [
      ["粘贴", "输入 Shopify 商品链接。"],
      ["选择", "选择垂直领域和创意角度。"],
      ["生成", "获得分镜和创意素材。"],
      ["发布", "拍摄、剪辑、测试并快速迭代。"],
    ],
    domainsTitle: "覆盖的细分领域",
    domains: ["美妆", "服饰", "家居", "宠物", "健身", "消费电子", "母婴", "通用电商"],
    seoTitle: "同时服务自然增长和付费投放",
    seoPoints: [
      "把商品详情页转化成可持续复用的视频资产。",
      "通过品类合规提示，让卖点表达更真实可信。",
      "稳定产出 Hook、旁白和字幕，方便快速测试创意方向。",
    ],
    ctaTitle: "开始生成下一条垂直视频简报",
    ctaDesc: "先放入商品链接，再围绕你要测试的领域和角度调整输出。",
    footer: "电商短视频创意的 AI 副驾驶。",
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
      "AI vertical video storyboard and TikTok ad creative generator for Shopify and ecommerce sellers.",
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
        <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t.badge}
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
              {t.desc}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/storyboard"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                {t.primary}
              </Link>
              <Link
                href="/tiktok-adgen"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/[0.12] px-6 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-white"
              >
                {t.secondary}
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {t.metrics.map(([value, label]) => (
                <div key={label} className="border-l border-white/[0.08] pl-4">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-xs leading-5 text-white/40">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-500/15 via-cyan-500/10 to-emerald-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b0b11]/90 shadow-2xl shadow-black/40">
              <div className="border-b border-white/[0.08] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">{t.previewTitle}</div>
                    <div className="mt-1 text-xs text-white/35">{t.previewMeta}</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    {t.previewProduct}
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-5">
                {t.scenes.map((scene) => (
                  <div key={scene.time} className="grid grid-cols-[64px_1fr] gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                    <div>
                      <div className="text-xs font-mono text-cyan-300">{scene.time}</div>
                      <div className="mt-2 text-[11px] uppercase text-white/30">{scene.label}</div>
                    </div>
                    <p className="text-sm leading-6 text-white/68">{scene.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.sectionTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-white/45">{t.sectionDesc}</p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {t.features.map((feature) => (
                <article key={feature.title} className="rounded-2xl border border-white/[0.08] bg-[#08080d] p-5">
                  <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/45">{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
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
                    <div className="mt-1 text-sm text-white/45">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">{t.domainsTitle}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.domains.map((domain) => (
                  <span key={domain} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-xs text-white/60">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="text-xl font-semibold">{t.seoTitle}</h2>
              <ul className="mt-4 space-y-3">
                {t.seoPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-white/55">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 sm:p-10">
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
