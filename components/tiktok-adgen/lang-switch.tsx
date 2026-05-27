"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n/context";

const options: Array<{ value: Locale; label: string; short: string }> = [
  { value: "en", label: "English", short: "EN" },
  { value: "zh", label: "中文", short: "中文" },
];

export function LangSwitch() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = options.find((option) => option.value === locale) || options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Switch language"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-xs font-medium text-white/62 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
      >
        <span>{current.short}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[128px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a0a0f]/95 py-1 shadow-xl shadow-black/40 backdrop-blur-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setLocale(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-all ${
                locale === option.value ? "bg-white/[0.06] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span>{option.label}</span>
              <span className="text-white/30">{option.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
