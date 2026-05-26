import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Storyboard Generator for Shopify Products - ShopPilot",
  description:
    "Generate niche-specific TikTok and vertical video storyboards from Shopify product links, including scene timing, camera direction, narration, overlays, and production notes.",
  openGraph: {
    title: "AI Video Storyboard Generator for Shopify Products - ShopPilot",
    description:
      "Turn Shopify product links into scene-by-scene vertical video storyboards with domain-specific creative direction.",
    url: "https://shoppilot.help/storyboard",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/storyboard" },
};

export default function StoryboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
