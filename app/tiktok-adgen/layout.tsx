import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok Ad Creative AI — ShopPilot",
  description:
    "Paste a Shopify product link and instantly generate TikTok ad hooks, scripts, voiceovers, and subtitles with AI. Boost your ecommerce ad performance.",
  openGraph: {
    title: "TikTok Ad Creative AI — ShopPilot",
    description:
      "Paste a Shopify product link and instantly generate TikTok ad hooks, scripts, voiceovers, and subtitles with AI.",
    url: "https://shoppilot.help/tiktok-adgen",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/tiktok-adgen" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
