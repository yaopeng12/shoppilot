import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — ShopPilot",
  description:
    "Choose a plan that fits your Shopify store. Start free, upgrade anytime. All plans include core AI features.",
  openGraph: {
    title: "Pricing — ShopPilot",
    description: "Choose a plan that fits your Shopify store. Start free, upgrade anytime.",
    url: "https://shoppilot.help/pricing",
    siteName: "ShopPilot",
    type: "website",
  },
  alternates: { canonical: "https://shoppilot.help/pricing" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
