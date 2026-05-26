import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/tiktok-adgen/providers";
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
    default: "ShopPilot - AI TikTok Ad Creative and Video Storyboard Generator",
    template: "%s",
  },
  description:
    "Generate vertical video storyboards, TikTok ad hooks, scripts, voiceovers, and subtitles from Shopify product links. Built for ecommerce sellers and creative teams.",
  keywords: [
    "Shopify AI",
    "TikTok ad generator",
    "AI storyboard generator",
    "vertical video generator",
    "ecommerce ad creative",
    "Shopify TikTok ads",
    "product video script",
    "UGC script generator",
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
    title: "ShopPilot - AI TikTok Ad Creative and Video Storyboard Generator",
    description:
      "Turn Shopify product links into vertical video storyboards, TikTok ad scripts, hooks, voiceovers, and subtitles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopPilot - AI TikTok Ad Creative and Video Storyboard Generator",
    description:
      "Generate vertical video storyboards and TikTok ad creatives from Shopify product links.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
