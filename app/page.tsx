"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";

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

const i18n = {
  en: {
    badge: "Shopify → TikTok Ad Creative",
    h1: "Generate Viral TikTok Scripts",
    h1b: "From Shopify Product URLs",
    desc: "Paste any Shopify product link. Get scroll-stopping hooks, video scripts, voiceovers, and subtitles — ready to film in seconds.",
    cta: "Start Free",
    demo: "See Demo",
    howTitle: "How It Works",
    steps: [
      { num: "01", title: "Paste Product Link", desc: "Drop any Shopify URL into the input field." },
      { num: "02", title: "AI Generates Content", desc: "Get hooks, video scripts, voiceover copy, and timed subtitles." },
      { num: "03", title: "Copy, Film & Post", desc: "Copy the content, shoot your video, and publish on TikTok." },
    ],
    demoTitle: "See What You Get",
    demoDesc: "Here's a real example — a moisturizer product link turned into TikTok ad content",
    tabLabels: { Hooks: "Hooks", Script: "Script", Voiceover: "Voiceover", Subtitles: "Subtitles" },
    tryCta: "Try It Free",
    ctaTitle: "Stop Writing Ad Scripts by Hand",
    ctaDesc: "Paste a link. Get a full TikTok ad in seconds.",
    ctaBtn: "Get Started",
    footer: { slogan: "AI Copilot for Shopify Sellers.", company: "COMPANY", contactUs: "Contact Us", followUs: "FOLLOW US", legal: "LEGAL", privacy: "Privacy Policy", terms: "Terms of Service", copyright: "© 2026 ShopPilot.help. All Rights Reserved." },
  },
  zh: {
    badge: "Shopify → TikTok 广告素材",
    h1: "粘贴商品链接",
    h1b: "自动生成爆款 TikTok 脚本",
    desc: "粘贴任意 Shopify 商品链接，即刻获得广告 Hook、视频脚本、配音文案和字幕 — 几秒搞定，直接开拍。",
    cta: "免费开始",
    demo: "看演示",
    howTitle: "三步搞定",
    steps: [
      { num: "01", title: "粘贴商品链接", desc: "把任意 Shopify 商品 URL 粘贴到输入框。" },
      { num: "02", title: "AI 生成内容", desc: "获得 Hook、视频脚本、配音文案和带时间轴的字幕。" },
      { num: "03", title: "复制、拍摄、发布", desc: "复制内容，拍摄视频，发布到 TikTok。" },
    ],
    demoTitle: "看看效果",
    demoDesc: "真实示例 — 一个面霜商品链接生成的 TikTok 广告内容",
    tabLabels: { Hooks: "Hook 开头", Script: "视频脚本", Voiceover: "配音文案", Subtitles: "字幕" },
    tryCta: "免费试用",
    ctaTitle: "别再手写广告脚本了",
    ctaDesc: "粘贴链接，几秒获得完整 TikTok 广告内容。",
    ctaBtn: "立即开始",
    footer: { slogan: "Shopify 卖家的 AI 副驾驶。", company: "公司", contactUs: "联系我们", followUs: "关注我们", legal: "法律", privacy: "隐私政策", terms: "服务条款", copyright: "© 2026 ShopPilot.help 保留所有权利。" },
  },
} as const;

export default function ShopPilotLanding() {
  const { user } = useUser();
  const { locale } = useI18n();
  const t = i18n[locale];
  const [activeTab, setActiveTab] = useState<string>("Hooks");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ShopPilot",
    url: "https://shoppilot.help",
    description: t.desc,
    applicationCategory: "BusinessApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar isSignedIn={!!user} />

      {/* Hero — single focused message */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs text-white/50 mb-8 tracking-wide">
            {t.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {t.h1}
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t.h1b}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/45 leading-relaxed mb-10 max-w-xl mx-auto">
            {t.desc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tiktok-adgen"
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/20 inline-flex items-center"
            >
              {t.cta}
            </Link>
            <button
              type="button"
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="h-12 px-8 rounded-xl border border-white/[0.12] text-white/70 text-sm font-medium hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200"
            >
              {t.demo}
            </button>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight mb-14">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            {t.howTitle}
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {t.steps.map((s, i) => (
            <div key={i} className="relative text-center px-4">
              <div className="text-5xl font-black text-white/[0.04] mb-3 select-none">{s.num}</div>
              <h3 className="text-base font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed">{s.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-8 -right-3 w-6 text-white/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Demo — proves the value */}
      <section id="demo" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {t.demoTitle}
            </span>
          </h2>
          <p className="text-white/35 text-sm max-w-md mx-auto">{t.demoDesc}</p>
        </div>

        {/* Mock product header */}
        <div className="rounded-t-2xl border border-b-0 border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0 flex items-center justify-center text-white/20 text-lg">
            🧴
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">Hydrating Face Cream — Deep Moisture Repair</div>
            <div className="text-xs text-white/30 truncate">example-store.myshopify.com</div>
          </div>
          <div className="text-emerald-400 font-bold text-sm shrink-0">$12.99</div>
        </div>

        <div className="rounded-b-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-white/[0.06] px-4 flex gap-1">
            {demoTabKeys.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm transition-all relative ${activeTab === tab ? "text-white" : "text-white/40 hover:text-white/60"}`}
              >
                {t.tabLabels[tab]}
                {activeTab === tab && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />}
              </button>
            ))}
          </div>

          {/* Hooks — card grid style */}
          {activeTab === "Hooks" && (
            <div className="p-5 grid md:grid-cols-2 gap-3">
              {demoData.Hooks[locale].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/20 p-4 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-violet-400/70 bg-violet-500/10 px-2 py-0.5 rounded-md">click to copy</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-[9px] font-bold text-violet-300/70">
                      {i + 1}
                    </div>
                    <span className="text-[9px] text-white/20 uppercase tracking-wider font-medium">Hook</span>
                  </div>
                  <div className="text-sm leading-relaxed text-white/70 group-hover:text-white transition-colors font-medium">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Script — timeline style */}
          {activeTab === "Script" && (
            <div className="p-5">
              <div className="relative">
                <div className="absolute left-[33px] top-0 bottom-0 w-px bg-white/[0.06]" />
                <div className="space-y-0">
                  {demoData.Script[locale].map((item, i) => {
                    const match = item.match(/^\[(.+?)\]\s*(.+)$/);
                    const time = match?.[1] || "";
                    const text = match?.[2] || item;
                    return (
                      <div key={i} className="flex items-start gap-3.5 py-3 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                        <div className="relative z-10 shrink-0">
                          <div className="w-[18px] h-[18px] rounded-full bg-[#06060a] border-2 border-cyan-500/30 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-cyan-400/60" />
                          </div>
                        </div>
                        <span className="text-[11px] text-cyan-400/60 font-mono min-w-[55px] shrink-0 pt-0.5 bg-cyan-500/5 px-1.5 py-0.5 rounded">
                          {time}
                        </span>
                        <span className="text-sm text-white/55 leading-relaxed">{text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Voiceover — teleprompter style */}
          {activeTab === "Voiceover" && (
            <div className="p-5">
              <div className="rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] p-6 space-y-4">
                {demoData.Voiceover[locale].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-amber-400/40 text-lg leading-none mt-0.5">"</span>
                    <p className="text-[15px] text-white/60 leading-relaxed">{item.replace(/^[""]|[""]$/g, "")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtitles — compact timeline */}
          {activeTab === "Subtitles" && (
            <div className="p-4">
              <div className="grid gap-1.5">
                {demoData.Subtitles[locale].map((item, i) => {
                  const match = item.match(/^\[(.+?)\]\s*(.+)$/);
                  const time = match?.[1] || "";
                  const text = match?.[2] || item;
                  return (
                    <div key={i} className="flex items-center gap-4 px-4 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-2 shrink-0 w-[50px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-400 transition-colors" />
                        <span className="text-[11px] text-emerald-400/50 font-mono">{time}</span>
                      </div>
                      <div className="text-sm text-white/55 group-hover:text-white/75 transition-colors">{text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/tiktok-adgen"
            className="h-11 px-7 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/20 inline-flex items-center"
          >
            {t.tryCta}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-10 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/10 blur-[100px] rounded-full" />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                {t.ctaTitle}
              </span>
            </h3>
            <p className="text-white/35 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
              {t.ctaDesc}
            </p>
            <Link
              href="/tiktok-adgen"
              className="h-12 px-8 rounded-xl bg-white text-black text-base font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/10 inline-flex items-center"
            >
              {t.ctaBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-3">ShopPilot</div>
              <p className="text-xs text-white/35 leading-relaxed">{t.footer.slogan}</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/50 mb-3 tracking-wide uppercase">{t.footer.company}</div>
              <a href="mailto:hi@shoppilot.help" className="block text-xs text-white/35 hover:text-white/60 transition-colors">{t.footer.contactUs}</a>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/50 mb-3 tracking-wide uppercase">{t.footer.followUs}</div>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-white/35 hover:text-white/60 transition-colors">GitHub</a>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/50 mb-3 tracking-wide uppercase">{t.footer.legal}</div>
              <a href="#" className="block text-xs text-white/35 hover:text-white/60 transition-colors">{t.footer.privacy}</a>
              <a href="#" className="block text-xs text-white/35 hover:text-white/60 transition-colors mt-1.5">{t.footer.terms}</a>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 text-center text-xs text-white/25">{t.footer.copyright}</div>
        </div>
      </footer>
    </div>
  );
}
