export default function ShopPilotLanding() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ShopPilot</h1>
            <p className="text-sm text-white/60">AI Copilot for Shopify Sellers</p>
          </div>

          <button className="bg-white text-black px-5 py-2 rounded-xl font-medium hover:opacity-90 transition">
            Join Waitlist
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 mb-6">
            Shopify AI Automation Platform
          </div>

          <h2 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Grow Your Shopify Store With AI
          </h2>

          <p className="text-lg text-white/70 leading-8 mb-10">
            ShopPilot helps ecommerce sellers automate product descriptions,
            ad creatives, SEO optimization, customer replies, and marketing
            workflows using AI agents.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition">
              Get Early Access
            </button>

            <button className="border border-white/20 px-6 py-3 rounded-2xl hover:bg-white/5 transition">
              View Demo
            </button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">AI Product Generator</h3>
              <p className="text-white/60 text-sm leading-6">
                Generate high-converting Shopify product descriptions, titles,
                and SEO metadata instantly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">TikTok Ad Creative AI</h3>
              <p className="text-white/60 text-sm leading-6">
                Automatically generate viral ad hooks, scripts, and marketing
                copy for ecommerce campaigns.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">Store Automation Agents</h3>
              <p className="text-white/60 text-sm leading-6">
                AI agents that optimize workflows, analyze products, and improve
                conversion rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="text-4xl font-bold mb-3">10x</div>
            <p className="text-white/60">Faster product content generation</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="text-4xl font-bold mb-3">AI</div>
            <p className="text-white/60">Powered ecommerce workflows</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="text-4xl font-bold mb-3">24/7</div>
            <p className="text-white/60">Automated growth optimization</p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h3 className="text-4xl font-bold mb-6">
          Built for Modern Ecommerce Teams
        </h3>

        <p className="text-white/70 text-lg leading-8 mb-10">
          ShopPilot combines AI automation, ecommerce intelligence, and growth
          optimization into one streamlined platform.
        </p>

        <button className="bg-white text-black px-8 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition">
          Start Building With AI
        </button>
      </section>

      <footer className="border-t border-white/10 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div>© 2026 ShopPilot.help</div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
            <a href="#" className="hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
