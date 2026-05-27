"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import { LangSwitch } from "./lang-switch";

interface NavbarProps {
  isSignedIn: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function Navbar({ isSignedIn, user }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/storyboard", label: t.nav.storyboard },
    { href: "/inspiration", label: t.nav.inspiration },
    { href: "/knowledge", label: t.nav.knowledge },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/dashboard", label: t.nav.dashboard, auth: true },
  ];

  const visibleLinks = navLinks.filter((l) => !l.auth || isSignedIn);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#06060a]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent hover:to-white/90 transition-all shrink-0"
        >
          ShopPilot
        </Link>

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

        <div className="flex items-center gap-2">
          <LangSwitch />
          {isSignedIn && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-all"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-7 h-7 rounded-full border border-white/[0.1]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-violet-600/80 flex items-center justify-center text-xs font-medium text-white">
                    {initials}
                  </div>
                )}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={cn("text-white/50 transition-transform", userMenuOpen && "rotate-180")}
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0c0c10] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="hidden md:inline-flex h-8 px-4 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-all duration-200 items-center"
            >
              {t.nav.login}
            </Link>
          )}

          <button
            type="button"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

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
            {isSignedIn ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="mt-2 px-4 py-2.5 rounded-lg border border-white/[0.1] text-white/70 text-sm text-center hover:bg-white/[0.05] transition-all"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium text-center"
              >
                {t.nav.login}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
