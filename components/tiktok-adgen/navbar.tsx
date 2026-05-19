"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/components/ui/cn";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/tiktok-adgen", label: "AI 生成" },
  { href: "/pricing", label: "方案" },
  { href: "/dashboard", label: "用户中心", auth: true },
];

export function Navbar({ isSignedIn }: { isSignedIn: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleLinks = navLinks.filter((l) => !l.auth || isSignedIn);

  return (
    <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#06060a]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent hover:to-white/90 transition-all shrink-0"
        >
          ShopPilot
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm transition-all duration-200",
                  active
                    ? "text-white bg-white/[0.08]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <Link
              href="/sign-in"
              className="hidden md:inline-flex h-8 px-4 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all duration-200 items-center"
            >
              登录
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#06060a]/95 backdrop-blur-xl animate-fade-in">
          <nav className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-1">
            {visibleLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-sm transition-all",
                    active
                      ? "text-white bg-white/[0.08]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {!isSignedIn && (
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium text-center"
              >
                登录
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
