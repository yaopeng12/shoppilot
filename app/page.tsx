"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";
import { CountUp, FadeIn } from "@/components/tiktok-adgen/animated-section";

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
    compareTitle: "See the Difference",
    compareDesc: "Same product, two approaches. One takes 30 minutes, the other takes 3 seconds.",
    compareManual: "Manual Writing",
    compareManualTime: "~30 min",
    compareManualHook: "Buy our moisturizer! It's good for your skin. Shop now!",
    compareManualScript: "Show the product. Talk about features. Add a discount code. End with 'link in bio'.",
    compareAI: "ShopPilot AI",
    compareAITime: "3 sec",
    compareAIHook: "\"Stop scrolling if your skin peels every winter — I found the $12 fix that dermatologists actually use\"",
    compareAIScript: "Hook (0-3s): Extreme close-up of dry, flaky skin with text overlay \"Nothing $200 worked...\"\nPain (3-8s): Montage of failed products in trash, frustrated mirror check\nReveal (8-15s): Unboxing reaction, \"Wait, only $12?\"\nDemo (15-25s): Satisfying cream application, texture ASMR, before/after split screen\nCTA (25-30s): Glowing skin reveal, \"10K+ reviews, link in bio\" 🧴",
    compareBefore: "BEFORE",
    compareAfter: "AFTER",
    metricsTitle: "Trusted by Shopify Sellers Worldwide",
    metrics: [
      { value: 12800, suffix: "+", label: "Scripts Generated" },
      { value: 3200, suffix: "+", label: "Active Users" },
      { value: 85, suffix: "%", label: "Engagement Boost" },
      { value: 4.9, suffix: "/5", label: "User Rating", decimals: 1 },
    ],
    typingUrl: "https://your-store.myshopify.com/products/moisturizer",
    typingGenerating: "Generating hooks, scripts, voiceovers...",
    typingDone: "5 Hooks · 2 Scripts · 2 Voiceovers · Subtitles ready!",
    activity: [
      "Someone just generated a script for Nike Air Max 90",
      "A seller in LA created 3 hooks for their skincare line",
      "New voiceover generated for Stanley Tumbler",
      "Someone just exported SRT subtitles for their ad",
      "A Shopify store in NYC generated 5 hooks",
      "TikTok script created for wireless earbuds",
    ],
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
    compareTitle: "看看差距有多大",
    compareDesc: "同一个产品，两种方式。一个花 30 分钟，一个只要 3 秒。",
    compareManual: "手写文案",
    compareManualTime: "~30 分钟",
    compareManualHook: "我们的面霜很好用！快来买吧！限时优惠！",
    compareManualScript: "展示产品。介绍功能。加上优惠码。结尾说「链接在主页」。",
    compareAI: "ShopPilot AI",
    compareAITime: "3 秒",
    compareAIHook: "\"干皮姐妹冬天起皮停一下！我找到了皮肤科医生都在用的 79 元修复霜\"",
    compareAIScript: "开头 (0-3s): 干燥起皮皮肤超近特写，文字叠加\"200 块的面霜都没用...\"\n痛点 (3-8s): 各种产品被扔进垃圾桶的蒙太奇，镜子前的挫败感\n发现 (8-15s): 开箱反应，\"等等，才 79？\"\n演示 (15-25s): 满足感十足的涂抹画面，质地 ASMR，前后对比分屏\n收尾 (25-30s): 光滑皮肤展示，\"10000+ 好评，链接在主页\" 🧴",
    compareBefore: "之前",
    compareAfter: "之后",
    metricsTitle: "全球 Shopify 卖家都在用",
    metrics: [
      { value: 12800, suffix: "+", label: "已生成脚本" },
      { value: 3200, suffix: "+", label: "活跃用户" },
      { value: 85, suffix: "%", label: "互动率提升" },
      { value: 4.9, suffix: "/5", label: "用户评分", decimals: 1 },
    ],
    typingUrl: "https://your-store.myshopify.com/products/moisturizer",
    typingGenerating: "正在生成 Hook、脚本、配音...",
    typingDone: "5 条 Hook · 2 套脚本 · 2 段配音 · 字幕就绪！",
    activity: [
      "有人刚刚为 Nike Air Max 90 生成了脚本",
      "洛杉矶卖家为护肤品生成了 3 条 Hook",
      "Stanley 水杯生成了新的配音文案",
      "有人导出了广告的 SRT 字幕",
      "纽约 Shopify 店铺生成了 5 条 Hook",
      "为无线耳机创建了 TikTok 脚本",
    ],
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

  // Typing simulation state
  const [typedUrl, setTypedUrl] = useState("");
  const [typingPhase, setTypingPhase] = useState<"typing" | "generating" | "done">("typing");
  const typingIdx = useRef(0);

  useEffect(() => {
    const url = t.typingUrl;
    let timer: ReturnType<typeof setInterval>;

    if (typingPhase === "typing") {
      timer = setInterval(() => {
        typingIdx.current++;
        if (typingIdx.current <= url.length) {
          setTypedUrl(url.slice(0, typingIdx.current));
        } else {
          clearInterval(timer);
          setTimeout(() => setTypingPhase("generating"), 400);
        }
      }, 45);
    } else if (typingPhase === "generating") {
      timer = setTimeout(() => setTypingPhase("done"), 1800) as unknown as ReturnType<typeof setInterval>;
    } else {
      timer = setTimeout(() => {
        typingIdx.current = 0;
        setTypedUrl("");
        setTypingPhase("typing");
      }, 3500) as unknown as ReturnType<typeof setInterval>;
    }

    return () => clearTimeout(timer);
  }, [typingPhase, t.typingUrl]);

  // Activity ticker state
  const [activityIdx, setActivityIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setActivityIdx((prev) => (prev + 1) % t.activity.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [t.activity.length]);

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

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tiktok-adgen"
              className="h-14 px-10 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-base font-bold hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center"
            >
              {t.cta}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <button
              type="button"
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
            >
              {t.demo} →
            </button>
          </div>

          {/* Typing simulation */}
          <div className="mt-12 max-w-lg mx-auto">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-white/50 h-9 flex items-center">
                  {typedUrl}
                  {typingPhase === "typing" && <span className="inline-block w-px h-4 bg-violet-400 ml-0.5 animate-pulse" />}
                </div>
                <div className="shrink-0 h-9 px-4 rounded-lg bg-gradient-to-r from-violet-600/80 to-blue-600/80 text-white text-xs font-medium flex items-center">
                  {typingPhase === "generating" ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      {t.typingGenerating}
                    </span>
                  ) : typingPhase === "done" ? (
                    <span className="text-emerald-300 text-[11px]">{t.typingDone}</span>
                  ) : (
                    "Generate"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-lg sm:text-xl font-semibold text-center tracking-tight mb-10 text-white/50">
          {t.howTitle}
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

      {/* Before vs After comparison */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              <span className="bg-gradient-b from-white to-white/60 bg-clip-text text-transparent">
                {t.compareTitle}
              </span>
            </h2>
            <p className="text-white/35 text-sm max-w-md mx-auto">{t.compareDesc}</p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-5">
          {/* BEFORE — manual */}
          <FadeIn delay={0}>
            <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.03] p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded tracking-wider">{t.compareBefore}</span>
                  <span className="text-sm font-semibold text-white/70">{t.compareManual}</span>
                </div>
                <span className="text-xs text-rose-400/60 font-mono">{t.compareManualTime}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/25 mb-2 font-medium">Hook</div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3.5 text-sm text-white/40 leading-relaxed">
                    {t.compareManualHook}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/25 mb-2 font-medium">Script</div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3.5 text-sm text-white/40 leading-relaxed">
                    {t.compareManualScript}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* AFTER — AI */}
          <FadeIn delay={150}>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px] rounded-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded tracking-wider">{t.compareAfter}</span>
                    <span className="text-sm font-semibold text-white">{t.compareAI}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">{t.compareAITime}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Hook</div>
                    <div className="rounded-lg bg-white/[0.05] border border-violet-500/15 p-3.5 text-sm text-white/80 leading-relaxed font-medium">
                      {t.compareAIHook}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Script</div>
                    <div className="rounded-lg bg-white/[0.05] border border-violet-500/15 p-3.5 text-sm text-white/70 leading-relaxed whitespace-pre-line">
                      {t.compareAIScript}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Metrics — animated counters */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <FadeIn>
          <h2 className="text-center text-sm font-semibold text-white/40 uppercase tracking-wider mb-10">
            {t.metricsTitle}
          </h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {t.metrics.map((m, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="text-center rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-1">
                  <CountUp end={m.value} suffix={m.suffix} decimals={(m as any).decimals || 0} duration={2000 + i * 300} />
                </div>
                <div className="text-xs text-white/35">{m.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Demo — structured output cards */}
      <section id="demo" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {t.demoTitle}
            </span>
          </h2>
          <p className="text-white/35 text-sm max-w-md mx-auto">{t.demoDesc}</p>
        </div>

        <FadeIn>
          {/* Product card */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-4 mb-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0 flex items-center justify-center text-white/20 text-base">🧴</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">Hydrating Face Cream — Deep Moisture Repair</div>
              <div className="text-xs text-white/30 truncate">example-store.myshopify.com/products/moisturizer</div>
            </div>
            <div className="text-emerald-400 font-bold text-sm shrink-0">$12.99</div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { icon: "🪝", count: 5, label: t.tabLabels.Hooks },
              { icon: "🎬", count: 2, label: t.tabLabels.Script },
              { icon: "🎙️", count: 2, label: t.tabLabels.Voiceover },
              { icon: "📝", count: 2, label: t.tabLabels.Subtitles },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-3 flex items-center gap-2.5">
                <span className="text-base">{s.icon}</span>
                <div>
                  <div className="text-base font-bold text-white/90">{s.count}</div>
                  <div className="text-[10px] text-white/30">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Hooks card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center"><span className="text-xs">🪝</span></div>
              <span className="text-sm font-semibold">{t.tabLabels.Hooks}</span>
              <span className="text-[10px] text-white/25 ml-1">5</span>
            </div>
            <div className="grid md:grid-cols-2 gap-2.5">
              {demoData.Hooks[locale].map((item, i) => (
                <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-violet-500/[0.06] hover:border-violet-500/20 p-3.5 transition-all group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-4 h-4 rounded bg-violet-500/10 flex items-center justify-center text-[9px] font-bold text-violet-400">{i + 1}</span>
                    <span className="text-[9px] text-white/20 uppercase tracking-wider">Hook</span>
                  </div>
                  <div className="text-xs leading-relaxed text-white/65 group-hover:text-white/90 transition-colors">{item}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scripts + Voiceover side by side */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Script card */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center"><span className="text-xs">🎬</span></div>
                <span className="text-sm font-semibold">{t.tabLabels.Script}</span>
              </div>
              <div className="space-y-0">
                {demoData.Script[locale].map((item, i) => {
                  const match = item.match(/^\[(.+?)\]\s*(.+)$/);
                  const time = match?.[1] || "";
                  const text = match?.[2] || item;
                  return (
                    <div key={i} className="flex items-start gap-2.5 py-2 px-1 rounded-md hover:bg-white/[0.02] transition-colors">
                      <span className="text-[10px] text-cyan-400/50 font-mono bg-cyan-500/5 px-1.5 py-0.5 rounded shrink-0 mt-0.5">{time}</span>
                      <span className="text-xs text-white/50 leading-relaxed">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voiceover card */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"><span className="text-xs">🎙️</span></div>
                <span className="text-sm font-semibold">{t.tabLabels.Voiceover}</span>
              </div>
              <div className="space-y-3">
                {demoData.Voiceover[locale].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-400/30 text-sm leading-none mt-0.5 shrink-0">&ldquo;</span>
                    <p className="text-xs text-white/55 leading-relaxed">{item.replace(/^[""]|[""]$/g, "")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subtitles card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center"><span className="text-xs">📝</span></div>
              <span className="text-sm font-semibold">{t.tabLabels.Subtitles}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-x-6">
              {demoData.Subtitles[locale].map((item, i) => {
                const match = item.match(/^\[(.+?)\]\s*(.+)$/);
                const time = match?.[1] || "";
                const text = match?.[2] || item;
                return (
                  <div key={i} className="flex items-center gap-3 py-1.5 px-1 rounded-md hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-1.5 shrink-0 w-[40px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 group-hover:bg-emerald-400 transition-colors" />
                      <span className="text-[10px] text-emerald-400/40 font-mono">{time}</span>
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        <div className="text-center mt-8">
          <Link
            href="/tiktok-adgen"
            className="h-10 px-6 rounded-xl border border-white/[0.12] text-white/60 text-sm font-medium hover:text-white hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200 inline-flex items-center"
          >
            {t.tryCta}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.06] to-transparent p-10 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-violet-600/15 blur-[120px] rounded-full" />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                {t.ctaTitle}
              </span>
            </h3>
            <p className="text-white/45 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
              {t.ctaDesc}
            </p>
            <Link
              href="/tiktok-adgen"
              className="h-14 px-10 rounded-2xl bg-white text-black text-base font-bold hover:bg-white/90 transition-all duration-200 shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center"
            >
              {t.ctaBtn}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>

            {/* Live activity ticker */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="transition-all duration-500">{t.activity[activityIdx]}</span>
            </div>
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
