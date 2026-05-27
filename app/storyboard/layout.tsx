import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Cleaning Ad Pack Generator - ShopPilot",
  description:
    "Paste a pet cleaning product link and generate an integrated ad pack with automatic source scoring, pet-specific templates, UGC scripts, storyboard, shot list, captions, AI video prompts, and claim safety.",
  openGraph: {
    title: "Pet Cleaning Ad Pack Generator - ShopPilot",
    description:
      "Generate source matching, pet cleaning templates, UGC scripts, storyboards, captions, and claim-safe TikTok creative from one product link.",
    url: "https://shoppilot.help/storyboard",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/storyboard" },
};

export default function StoryboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
