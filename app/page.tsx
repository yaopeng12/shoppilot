"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/tiktok-adgen/navbar";

const features = [
  {
    icon: "⚡",
    title: "AI Product Generator",
    desc: "Generate high-converting Shopify product descriptions, titles, and SEO metadata instantly.",
  },
  {
    icon: "🎬",
    title: "TikTok Ad Creative AI",
    desc: "Automatically generate viral ad hooks, scripts, and marketing copy for ecommerce campaigns.",
  },
  {
    icon: "🤖",
    title: "Store Automation Agents",
    desc: "AI agents that optimize workflows, analyze products, and improve conversion rates.",
  },
];

const stats = [
  { value: "10x", label: "Faster product content generation" },
  { value: "AI", label: "Powered ecommerce workflows" },
  { value: "24/7", label: "Automated growth optimization" },
];

const demoTabs = ["Hooks", "Script", "Voiceover", "Subtitles"] as const;

const demoData: Record<string, string[]> = {
  Hooks: [
    "\"Stop scrolling if you have dry skin...\"",
    "\"I tested 47 moisturizers — this \$12 one won\"",
    "\"POV: your skin finally stops peeling in winter\"",
    "\"Dermatologists don't want you to know this trick\"",
    "\"I threw away my \$200 skincare after trying this\"",
  ],
  Script: [
    "Hook (0-3s): Close-up of dry, flaky skin with text overlay \"Nothing worked...\"",
    "Problem (3-8s): Show frustration — trying multiple products, mirror shots",
    "Discovery (8-15s): Unboxing the product, first impression reaction",
    "Demo (15-25s): Applying the cream, texture shots, before/after split screen",
    "Proof (25-30s): Show results after 1 week, happy reaction, \"Link in bio\"",
  ],
  Voiceover: [
    "\"I spent hundreds on skincare that never worked...\"",
    "\"Then I found this moisturizer and everything changed.\"",
    "\"It's lightweight, absorbs in seconds, and my skin hasn't been this smooth in years.\"",
    "\"Over 10,000 five-star reviews — and now I know why.\"",
    "\"Link in bio, trust me your skin will thank you.\"",
  ],
  Subtitles: [
    "[0s] 🧴 Nothing worked for my dry skin...",
    "[3s] 😩 I tried everything. Creams, serums, masks...",
    "[8s] ✨ Until I found THIS \$12 moisturizer",
    "[15s] 💧 Look at that texture — absorbs instantly",
    "[25s] 🔥 10K+ reviews. Link in bio!",
  ],
};

export default function ShopPilotLanding() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<(typeof demoTabs)[number]>("Hooks");

  function scrollToDemo() {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ShopPilot",
    url: "https://shoppilot.help",
    description: "AI Copilot for Shopify Sellers — automate product descriptions, TikTok ad creatives, SEO, and marketing workflows.",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar isSignedIn={!!user} />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs text-white/50 mb-8 tracking-wide uppercase">
            Shopify AI Automation Platform
          </div>

          <h2 className="text-5xl lg:text-[4.25rem] font-bold leading-[1.1] mb-6 tracking-tight">
            <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
              Grow Your Shopify
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Store With AI
            </span>
          </h2>

          <p className="text-base text-white/50 leading-relaxed mb-10 max-w-lg">
            ShopPilot helps ecommerce sellers automate product descriptions,
            ad creatives, SEO optimization, customer replies, and marketing
            workflows using AI agents.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/tiktok-adgen"
              className="h-11 px-7 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-violet-500/20 inline-flex items-center"
            >
              Get Early Access
            </Link>

            <button
              type="button"
              onClick={scrollToDemo}
              className="h-11 px-7 rounded-xl border border-white/[0.12] text-white/80 text-sm font-medium hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4 animate-fade-in-up delay-200">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-0.5">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-[15px] mb-1.5 group-hover:text-white transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              See It In Action
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            Paste a Shopify product link, get TikTok-ready ad creatives in seconds
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          {/* Mock input bar */}
          <div className="border-b border-white/[0.06] p-4 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 shrink-0">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span className="text-sm text-white/30 truncate">https://example-store.myshopify.com/products/hydrating-face-cream</span>
            </div>
            <div className="h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-sm font-semibold flex items-center text-white/80">
              Generate
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/[0.06] px-4 flex gap-1">
            {demoTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm transition-all relative ${
                  activeTab === tab
                    ? "text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="p-5 space-y-2.5">
            {demoData[activeTab].map((item, i) => (
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
            Try It Free
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 text-center hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="text-4xl font-bold mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                {s.value}
              </div>
              <p className="text-white/40 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-8 lg:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/10 blur-[100px] rounded-full" />

          <div className="relative">
            <div className="inline-flex px-4 py-1.5 rounded-full bg-white/[0.06] text-xs text-white/50 mb-6 tracking-wide uppercase border border-white/[0.08]">
              AI Product Description Generator
            </div>

            <h3 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                Generate Shopify Product Copy With AI
              </span>
            </h3>

            <p className="text-white/40 text-base leading-relaxed mb-10 max-w-xl mx-auto">
              Instantly create product titles, descriptions, SEO metadata, and
              TikTok ad copy for your ecommerce store.
            </p>

            <Link
              href="/tiktok-adgen"
              className="h-12 px-8 rounded-xl bg-white text-black text-base font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/10 inline-flex items-center"
            >
              Start Building With AI
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <div>© 2026 ShopPilot.help</div>

          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((t) => (
              <a
                key={t}
                href="#"
                className="hover:text-white/60 transition-colors duration-200"
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
