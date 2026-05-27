"use client";

import { cn } from "@/components/ui/cn";
import { getMarketOptions, TARGET_MARKET_PROFILES, type TargetMarketCode } from "@/lib/localization/markets";
import { useI18n } from "@/lib/i18n/context";

type TargetMarketSelectProps = {
  value: TargetMarketCode;
  onChange: (value: TargetMarketCode) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
};

export function TargetMarketSelect({ value, onChange, label, hint, compact = false }: TargetMarketSelectProps) {
  const { locale } = useI18n();
  const options = getMarketOptions(locale);
  const current = TARGET_MARKET_PROFILES[value];

  return (
    <label className={cn("block", compact && "min-w-[220px]")}>
      {label && <span className="mb-1.5 block text-xs text-white/45">{label}</span>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TargetMarketCode)}
        className={cn(
          "h-11 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 text-sm text-white",
          "transition-all duration-200 hover:border-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          !compact && "h-12 rounded-xl",
        )}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code} className="bg-[#0a0a14] text-white">
            {option.code} · {option.label}
          </option>
        ))}
      </select>
      <div className={cn("mt-1.5 text-[11px] leading-5 text-white/35", compact && "line-clamp-2")}>
        {hint || `${current.nativeLanguage} · ${current.localizationLevel}`}
      </div>
    </label>
  );
}
