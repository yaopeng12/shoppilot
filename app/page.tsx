"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";

const demoTabs = ["Hooks", "Script", "Voiceover", "Subtitles"] as const;

const demoData: Record<string, { en: string[]; zh: string[] }> = {
  Hooks: {
    en: [
      "\"Stop scrolling if you have dry skin...\"",
      "\"I tested 47 moisturizers — this $12 one won\"",
      "\"POV: your skin finally stops peeling in winter\"",
      "\"Dermatologists don't want you to know this trick\"",
      "\"I threw away my $200 skincare after trying this\"",
    ],
    zh: [
      "\"干皮姐妹停一下！这个平价面霜救了我的脸...\"",
      "\"测了 47 款保湿霜，这款 79 元的赢了\"",
      "\"POV：冬天终于不再起皮了\"",
      "\"皮肤科医生不想让你知道的护肤秘诀\"",
      "\"用了这个之后我扔掉了 200 块的贵妇面霜\"",
    ],
  },
  Script: {
    en: [
      "Hook (0-3s): Close-up of dry, flaky skin — text: \"Nothing worked...\"",
      "Problem (3-8s): Trying multiple products, mirror shots, frustration",
      "Discovery (8-15s): Unboxing the product, first impression reaction",
      "Demo (15-25s): Applying cream, texture shots, before/after split",
      "Proof (25-30s): 1-week results, happy reaction, \"Link in bio\"",
    ],
    zh: [
      "开头 (0-3s): 干燥起皮皮肤特写 — 文字：\"什么都没用...\"",
      "痛点 (3-8s): 试了各种产品的挫败感，镜子前的无奈",
      "发现 (8-15s): 开箱产品，第一印象反应",
      "演示 (15-25s): 涂抹面霜，质地特写，前后对比",
      "证明 (25-30s): 一周后效果，开心反应，\"链接在主页\"",
    ],
  },
  Voiceover: {
    en: [
      "\"I spent hundreds on skincare that never worked...\"",
      "\"Then I found this moisturizer and everything changed.\"",
      "\"It's lightweight, absorbs in seconds, and my skin hasn't been this smooth in years.\"",
      "\"Over 10,000 five-star reviews — and now I know why.\"",
      "\"Link in bio, trust me your skin will thank you.\"",
    ],
    zh: [
      "\"我在护肤上花了几千块，但都没什么用...\"",
      "\"直到我发现了这款面霜，一切都变了。\"",
      "\"质地轻薄，几秒就吸收，我的皮肤好几年没这么滑了。\"",
      "\"超过一万条五星好评 — 现在我知道为什么了。\"",
      "\"链接在主页，相信我你的皮肤会感谢你的。\"",
    ],
  },
  Subtitles: {
    en: [
      "[0s] 🧴 Nothing worked for my dry skin...",
      "[3s] 😩 I tried everything. Creams, serums, masks...",
      "[8s] ✨ Until I found THIS $12 moisturizer",
      "[15s] 💧 Look at that texture — absorbs instantly",
      "[25s] 🔥 10K+ reviews. Link in bio!",
    ],
    zh: [
      "[0s] 🧴 干皮什么护肤品都没用...",
      "[3s] 😩 什么面霜、精华、面膜都试过了",
      "[8s] ✨ 直到我发现了这款 79 元面霜",
      "[15s] 💧 看这个质地 — 秒吸收",
      "[25s] 🔥 10000+ 好评！链接在主页",
    ],
  },
};

const demoTabKeys = ["Hooks", "Script", "Voiceover", "Subtitles"] as const;

export default function ShopPilotLanding() {
  const { user } = useUser();
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<(typeof demoTabs)[number]>("Hooks");

  function scrollToDemo() {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ShopPilot",
    url: "https://shoppilot.help",
    description: t.hero.desc,
    applicationCategory: "BusinessApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const tabLabels: Record<string, string> = {
    Hooks: locale === "zh" ? "Hook 开头" : "Hooks",
    Script: locale === "zh" ? "视频脚本" : "Script",
    Voiceover: locale === "zh" ? "配音文案" : "Voiceover",
    Subtitles: locale === "zh" ? "字幕" : "Subtitles",
  };

  return (
    <div className="min-h-screen text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar isSignedIn={!!user} />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs text-white/50 mb-8 tracking-wide uppercase">
            {t.hero.badge}
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
            <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
              {t.hero.title1}
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
          </h1>

          <p className="text-base text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
            {t.hero.desc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link
              href="/tiktok-adgen"
              className="h-11 px-7 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/20 inline-flex items-center"
            >
              {t.hero.cta}
            </Link>
            <button
              type="button"
              onClick={scrollToDemo}
              className="h-11 px-7 rounded-xl border border-white/[0.12] text-white/80 text-sm font-medium hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200"
            >
              {t.hero.demo}
            </button>
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-100">
            {[
              { name: t.platforms.shopify, desc: t.platforms.shopifyDesc },
              { name: t.platforms.woocommerce, desc: t.platforms.woocommerceDesc },
              { name: t.platforms.custom, desc: t.platforms.customDesc },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/60">
                  {p.name[0]}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white/80">{p.name}</div>
                  <div className="text-[11px] text-white/35">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl lg:text-4xl font-bold text-center tracking-tight mb-12 animate-fade-in-up">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            {t.benefits.title}
          </span>
        </h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in-up delay-100">
          {t.benefits.items.map((b, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-4 text-lg font-bold text-white/50">
                {["📈", "⚡", "💰", "💡", "🌍"][i]}
              </div>
              <h3 className="font-semibold text-sm mb-2">{b.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl lg:text-4xl font-bold text-center tracking-tight mb-12">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            {t.features.title}
          </span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.features.items.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                  {[
                    <path key="0" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
                    <path key="1" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
                    <path key="2" d="M12 20V10M18 20V4M6 20v-4" />,
                    <path key="3" d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
                    <path key="4" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
                    <path key="5" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />,
                  ][i]}
                </svg>
              </div>
              <h3 className="font-semibold text-[15px] mb-2 group-hover:text-white transition-colors">
                {f.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-center tracking-tight mb-10">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            {t.metrics.title}
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {t.metrics.items.map((m, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                {m.value}
              </div>
              <p className="text-white/40 text-xs">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {t.demo.title}
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto">{t.demo.desc}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          {/* Mock input */}
          <div className="border-b border-white/[0.06] p-4 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 shrink-0">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span className="text-sm text-white/30 truncate">
                https://example-store.myshopify.com/products/hydrating-face-cream
              </span>
            </div>
            <div className="h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-sm font-semibold flex items-center text-white/80">
              Generate
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/[0.06] px-4 flex gap-1">
            {demoTabKeys.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm transition-all relative ${
                  activeTab === tab ? "text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                {tabLabels[tab]}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="p-5 space-y-2.5">
            {demoData[activeTab][locale].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
              >
                <span className="text-xs text-white/20 mt-0.5 w-5 text-right shrink-0 font-mono">{i + 1}</span>
                <p className="text-sm text-white/70 leading-relaxed flex-1">{item}</p>
                <button
                  type="button"
                  className="shrink-0 text-xs text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/tiktok-adgen"
            className="h-11 px-7 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/20 inline-flex items-center"
          >
            {t.demo.tryCta}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-8 lg:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/10 blur-[100px] rounded-full" />
          <div className="relative">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                {t.cta.title1}
                <br />
                {t.cta.title2}
              </span>
            </h3>
            <p className="text-white/40 text-base leading-relaxed mb-8 max-w-xl mx-auto">
              {t.cta.desc}
            </p>
            <Link
              href="/tiktok-adgen"
              className="h-12 px-8 rounded-xl bg-white text-black text-base font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/10 inline-flex items-center"
            >
              {t.cta.button}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-3">
                ShopPilot
              </div>
              <p className="text-xs text-white/35 leading-relaxed">{t.footer.slogan}</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/50 mb-3 tracking-wide uppercase">{t.footer.company}</div>
              <div className="space-y-2">
                <a href="mailto:hi@shoppilot.help" className="block text-xs text-white/35 hover:text-white/60 transition-colors">
                  {t.footer.contactUs}
                </a>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/50 mb-3 tracking-wide uppercase">{t.footer.followUs}</div>
              <div className="space-y-2">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-white/35 hover:text-white/60 transition-colors">
                  GitHub
                </a>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/50 mb-3 tracking-wide uppercase">{t.footer.legal}</div>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-white/35 hover:text-white/60 transition-colors">{t.footer.privacy}</a>
                <a href="#" className="block text-xs text-white/35 hover:text-white/60 transition-colors">{t.footer.terms}</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 text-center text-xs text-white/25">
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
