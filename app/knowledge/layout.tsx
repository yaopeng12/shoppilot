import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Cleaning Knowledge Base - ShopPilot",
  description:
    "Pet cleaning ad template research, hook patterns, video structures, CTAs, tones, and candidate insights from public short-video ad data.",
  openGraph: {
    title: "Pet Cleaning Knowledge Base - ShopPilot",
    description:
      "Research-backed pet cleaning ad patterns for cat litter odor, litter tracking, automatic litter boxes, and pet-home cleaning creatives.",
    url: "https://shoppilot.help/knowledge",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/knowledge" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
