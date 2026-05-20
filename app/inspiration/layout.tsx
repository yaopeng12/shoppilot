import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Video Inspiration — ShopPilot",
  description:
    "Discover what's working on TikTok right now. AI-analyzed hooks, structures, and CTAs from top-performing product videos.",
  openGraph: {
    title: "Trending Video Inspiration — ShopPilot",
    description:
      "AI-analyzed hooks, structures, and CTAs from top-performing TikTok product videos.",
    url: "https://shoppilot.help/inspiration",
    siteName: "ShopPilot",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
