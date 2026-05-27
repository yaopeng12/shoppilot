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
    default: "ShopPilot - Pet Cleaning Ad Pack Generator",
    template: "%s",
  },
  description:
    "Generate pet cleaning ad packs from one product link: source matching, cat odor and litter templates, UGC scripts, storyboard, captions, AI video prompts, and claim-safe TikTok creative.",
  keywords: [
    "pet cleaning ad generator",
    "cat litter odor ads",
    "pet odor remover marketing",
    "cat urine cleaner ads",
    "pet hair remover TikTok ads",
    "1688 pet product sourcing",
    "UGC script generator for pet products",
    "TikTok pet ads",
    "pet ecommerce creative",
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
    title: "ShopPilot - Pet Cleaning Ad Pack Generator",
    description:
      "Turn pet cleaning product links into source matches, niche templates, UGC scripts, storyboards, captions, AI video prompts, and claim-safe TikTok ad packs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopPilot - Pet Cleaning Ad Pack Generator",
    description:
      "Generate source matching, pet cleaning templates, UGC scripts, storyboards, captions, and claim-safe TikTok ad packs.",
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
