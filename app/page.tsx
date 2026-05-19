import Link from "next/link";

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

export default function ShopPilotLanding() {
  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#06060a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              ShopPilot
            </h1>
            <p className="text-xs text-white/40">AI Copilot for Shopify Sellers</p>
          </div>

          <Link
            href="/tiktok-adgen"
            className="h-9 px-5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-200 inline-flex items-center"
          >
            Get Started
          </Link>
        </div>
      </header>

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

            <Link
              href="/tiktok-adgen"
              className="h-11 px-7 rounded-xl border border-white/[0.12] text-white/80 text-sm font-medium hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200 inline-flex items-center"
            >
              View Demo
            </Link>
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
          {/* Glow effect */}
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
