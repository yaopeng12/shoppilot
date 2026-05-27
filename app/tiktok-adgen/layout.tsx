import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Cleaning TikTok Ad Workflow - ShopPilot",
  description:
    "ShopPilot now focuses on pet cleaning ad packs: source matching, cat odor and litter templates, UGC scripts, storyboards, captions, and claim-safe TikTok creative.",
  openGraph: {
    title: "Pet Cleaning TikTok Ad Workflow - ShopPilot",
    description:
      "Generate integrated pet cleaning ad packs from one product link.",
    url: "https://shoppilot.help/tiktok-adgen",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/tiktok-adgen" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
