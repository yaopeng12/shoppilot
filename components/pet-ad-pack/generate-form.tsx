"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TargetMarketSelect } from "@/components/localization/target-market-select";
import type { TargetMarketCode } from "@/lib/localization/markets";

type Labels = {
  url: string;
  urlPlaceholder: string;
  note: string;
  notePlaceholder: string;
  market: string;
  marketHint: string;
  generate: string;
  generating: string;
  try: string;
};

type GenerateFormProps = {
  url: string;
  userNote: string;
  targetMarket: TargetMarketCode;
  loading: boolean;
  err: string | null;
  labels: Labels;
  onUrlChange: (value: string) => void;
  onUserNoteChange: (value: string) => void;
  onTargetMarketChange: (value: TargetMarketCode) => void;
  onGenerate: () => void;
  onExample: (value: string, note?: string) => void;
};

const examples = [
  {
    name: "Cat litter mat",
    url: "https://www.amazon.com/dp/B0B7KX5K4H",
    note: "cat litter tracking mat, litter box floor cleanup",
  },
  {
    name: "Odor spray",
    url: "https://www.amazon.com/dp/B07J3Z7N8S",
    note: "cat urine odor remover spray, fabric and sofa odor",
  },
  {
    name: "Hair remover",
    url: "https://www.amazon.com/dp/B0B9R9R4KS",
    note: "pet hair remover for couch, clothes, and furniture",
  },
];

export function PetAdPackGenerateForm({
  url,
  userNote,
  targetMarket,
  loading,
  err,
  labels,
  onUrlChange,
  onUserNoteChange,
  onTargetMarketChange,
  onGenerate,
  onExample,
}: GenerateFormProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/85 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <label className="block">
          <span className="mb-1.5 block text-xs text-white/45">{labels.url}</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </span>
            <Input
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && onGenerate()}
              placeholder={labels.urlPlaceholder}
              className="h-12 rounded-xl border-white/[0.1] bg-white/[0.05] pl-11 text-white placeholder:text-white/25"
            />
          </div>
        </label>

        <TargetMarketSelect
          value={targetMarket}
          onChange={onTargetMarketChange}
          label={labels.market}
          hint={labels.marketHint}
        />
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs text-white/45">{labels.note}</span>
        <Input
          value={userNote}
          onChange={(event) => onUserNoteChange(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onGenerate()}
          placeholder={labels.notePlaceholder}
          className="h-12 rounded-xl border-white/[0.1] bg-white/[0.05] text-white placeholder:text-white/25"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 px-7 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-blue-500 disabled:opacity-55"
        >
          {loading ? labels.generating : labels.generate}
        </Button>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white/30">{labels.try}</span>
          {examples.map((example) => (
            <button
              key={example.name}
              type="button"
              onClick={() => onExample(example.url, example.note)}
              className="text-white/42 underline decoration-white/20 underline-offset-2 transition hover:text-white/75"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-rose-400">{err}</p>}
    </div>
  );
}
