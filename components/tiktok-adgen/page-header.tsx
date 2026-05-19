"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { PublicUser } from "@/lib/tiktok-adgen/types";
import { cn } from "@/components/ui/cn";

type UsagePill = { text: string; color: string } | null;

export function PageHeader({
  user,
  usagePill,
  onOpenPricing,
  onOpenTeam,
}: {
  user: PublicUser | null;
  usagePill: UsagePill;
  onOpenPricing: () => void;
  onOpenTeam: () => void;
}) {
  return (
    <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#06060a]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent hover:to-white/90 transition-all">
            TikTok Ad Creative AI
          </Link>
          <div className="text-xs text-white/35 mt-0.5">输入 Shopify 商品链接，自动生成 Hooks / 脚本 / 配音 / 字幕</div>
        </div>

        <div className="flex items-center gap-2">
          {usagePill ? (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/60">
              <span className={cn("w-1.5 h-1.5 rounded-full", usagePill.color)} />
              <span className="whitespace-nowrap">{usagePill.text}</span>
            </div>
          ) : null}

          <Link
            href="/pricing"
            className="h-8 px-3.5 rounded-lg border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-xs inline-flex items-center"
          >
            方案
          </Link>

          {user?.plan === "team" ? (
            <button
              type="button"
              className="h-8 px-3.5 rounded-lg border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-xs"
              onClick={onOpenTeam}
            >
              团队
            </button>
          ) : null}

          {!user ? (
            <Link
              href="/sign-in"
              className="h-8 px-4 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all duration-200 inline-flex items-center"
            >
              登录
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="h-8 px-3.5 rounded-lg border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-xs inline-flex items-center"
              >
                仪表盘
              </Link>
              <UserButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
