import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shoppilot.help"),
  title: {
    default: "ShopPilot — AI Copilot for Shopify Sellers",
    template: "%s",
  },
  description:
    "Automate product descriptions, TikTok ad creatives, SEO, and marketing workflows with AI agents. Built for Shopify sellers.",
  keywords: [
    "Shopify AI",
    "product description generator",
    "TikTok ads",
    "ecommerce automation",
    "Shopify SEO",
    "ad creative generator",
    "AI marketing",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shoppilot.help",
    siteName: "ShopPilot",
    title: "ShopPilot — AI Copilot for Shopify Sellers",
    description:
      "Automate product descriptions, TikTok ad creatives, SEO, and marketing workflows with AI agents.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopPilot — AI Copilot for Shopify Sellers",
    description:
      "Automate product descriptions, TikTok ad creatives, SEO, and marketing workflows with AI agents.",
  },
  alternates: { canonical: "https://shoppilot.help" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
