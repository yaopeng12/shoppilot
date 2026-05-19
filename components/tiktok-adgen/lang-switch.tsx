"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n, type Locale } from "@/lib/i18n/context";

const options: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
];

export function LangSwitch() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = options.find((o) => o.value === locale)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-8 px-2.5 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-xs inline-flex items-center gap-1.5"
      >
        <span>{current.flag}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 min-w-[120px] rounded-xl border border-white/[0.1] bg-[#0a0a0f]/95 backdrop-blur-xl shadow-xl shadow-black/40 py-1 animate-fade-in z-50">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { setLocale(o.value); setOpen(false); }}
              className={`w-full px-3.5 py-2 text-left text-xs flex items-center gap-2 transition-all ${
                locale === o.value
                  ? "text-white bg-white/[0.06]"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span>{o.flag}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
