import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - ShopPilot",
  description:
    "Choose a ShopPilot plan for AI video storyboards, TikTok ad scripts, hooks, voiceovers, subtitles, and ecommerce creative workflows.",
  openGraph: {
    title: "Pricing - ShopPilot",
    description:
      "Choose a plan for AI-powered ecommerce video creative and TikTok ad generation.",
    url: "https://shoppilot.help/pricing",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/pricing" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
