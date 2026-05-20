import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creative Knowledge Base — ShopPilot",
  description:
    "AI-extracted templates and patterns from top-performing TikTok product ads. Hook formulas, video structures, CTAs, and more.",
  openGraph: {
    title: "Creative Knowledge Base — ShopPilot",
    description:
      "AI-extracted templates from top-performing TikTok product ads.",
    url: "https://shoppilot.help/knowledge",
    siteName: "ShopPilot",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
