import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok Ad Script Generator for Shopify - ShopPilot",
  description:
    "Paste a Shopify product link and generate TikTok ad hooks, scripts, voiceovers, subtitles, and creative copy for ecommerce campaigns.",
  openGraph: {
    title: "TikTok Ad Script Generator for Shopify - ShopPilot",
    description:
      "Generate TikTok ad hooks, scripts, voiceovers, and subtitles from Shopify product URLs.",
    url: "https://shoppilot.help/tiktok-adgen",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/tiktok-adgen" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
