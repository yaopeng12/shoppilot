import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing for Pet Cleaning Ad Packs - ShopPilot",
  description:
    "Choose a ShopPilot plan for pet cleaning ad packs, source matching, niche templates, UGC scripts, storyboards, AI video prompts, and claim-safe creative workflows.",
  openGraph: {
    title: "Pricing for Pet Cleaning Ad Packs - ShopPilot",
    description:
      "Choose a plan for pet cleaning source matching, templates, scripts, storyboards, and claim-safe TikTok creative.",
    url: "https://shoppilot.help/pricing",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/pricing" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
