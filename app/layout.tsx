import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/tiktok-adgen/providers";
import { GoogleAnalytics } from "@next/third-parties/google";
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
    default: "ShopPilot - TikTok UGC Ad Generator for Pet Dropshipping & Shopify Stores",
    template: "%s",
  },
  description:
    "AI-powered TikTok UGC ad generator for pet dropshipping and Shopify stores. Create cat litter ad scripts, pet cleaning video ads, and winning product creatives with 1688 sourcing match.",
  keywords: [
    "TikTok UGC ad generator",
    "pet dropshipping winning products",
    "cat litter ad scripts",
    "AI tool for Shopify pet stores",
    "pet cleaning ad generator",
    "cat litter odor ads",
    "pet odor remover marketing",
    "cat urine cleaner ads",
    "pet hair remover TikTok ads",
    "1688 pet product sourcing",
    "UGC script generator for pet products",
    "TikTok pet ads",
    "pet ecommerce creative",
    "Shopify pet store marketing",
    "dropshipping pet products AI",
    "pet product video ad creator",
    "winning product ad script",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shoppilot.help",
    siteName: "ShopPilot",
    title: "ShopPilot - TikTok UGC Ad Generator for Pet Dropshipping",
    description:
      "Turn pet product links into TikTok UGC ads with 1688 sourcing match, cat litter scripts, storyboard, and winning product creatives for Shopify pet stores.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopPilot - TikTok UGC Ad Generator for Pet Dropshipping",
    description:
      "AI-powered TikTok UGC ad generator: cat litter scripts, pet cleaning video ads, 1688 sourcing, and winning product creatives for Shopify pet stores.",
  },
  alternates: {
    canonical: "https://shoppilot.help",
    languages: {
      en: "https://shoppilot.help",
      zh: "https://shoppilot.help",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <GoogleAnalytics gaId="G-8PD0RQZ23K" />
      </body>
    </html>
  );
}
