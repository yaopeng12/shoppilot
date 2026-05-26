"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VERTICAL_DOMAINS, type VerticalDomainId } from "@/lib/storyboard/types";

interface GenerateFormLabels {
  verticalDomain: string;
  creativeAngle: string;
  urlPlaceholder: string;
  generate: string;
  generating: string;
  try: string;
  upgrade: string;
  verticalOptions: Record<VerticalDomainId, string>;
  creativePlaceholders: Record<VerticalDomainId, string>;
}

interface GenerateFormProps {
  url: string;
  vertical: VerticalDomainId;
  creativeAngle: string;
  loading: boolean;
  err: string | null;
  limitMsg: string | null;
  authMsg: string | null;
  signInLabel: string;
  labels: GenerateFormLabels;
  onUrlChange: (url: string) => void;
  onVerticalChange: (vertical: VerticalDomainId) => void;
  onCreativeAngleChange: (angle: string) => void;
  onGenerate: () => void;
  onUpgrade: () => void;
  onExample: (url: string) => void;
}

const exampleLinks = [
  { name: "Allbirds Tree Runners", url: "https://allbirds.com/products/mens-tree-runners" },
  { name: "Stanley Quencher Tumbler", url: "https://www.stanley1913.com/products/quencher-h2-0-flowstate-tumbler-40-oz" },
];

export function GenerateForm({
  url,
  vertical,
  creativeAngle,
  loading,
  err,
  limitMsg,
  authMsg,
  signInLabel,
  labels,
  onUrlChange,
  onVerticalChange,
  onCreativeAngleChange,
  onGenerate,
  onUpgrade,
  onExample,
}: GenerateFormProps) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="relative group">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-violet-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
          <div className="mb-5 grid gap-3 md:grid-cols-[220px_1fr]">
            <label className="block">
              <span className="mb-1.5 block text-xs text-white/40">{labels.verticalDomain}</span>
              <select
                value={vertical}
                onChange={(e) => onVerticalChange(e.target.value as VerticalDomainId)}
                className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 text-sm text-white outline-none transition-colors focus:border-violet-400/60"
              >
                {Object.entries(VERTICAL_DOMAINS).map(([id, domain]) => (
                  <option key={id} value={id} className="bg-zinc-950 text-white">
                    {labels.verticalOptions[id as VerticalDomainId] || domain.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-white/40">{labels.creativeAngle}</span>
              <Input
                value={creativeAngle}
                onChange={(e) => onCreativeAngleChange(e.target.value)}
                placeholder={labels.creativePlaceholders[vertical]}
                className="h-11 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/25 rounded-xl"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <Input
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder={labels.urlPlaceholder}
                className="pl-11 h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/25 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && onGenerate()}
              />
            </div>
            <Button
              onClick={onGenerate}
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {labels.generating}
                </span>
              ) : (
                labels.generate
              )}
            </Button>
          </div>

          {/* Example links */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/30">{labels.try}</span>
            {exampleLinks.map((ex) => (
              <button
                key={ex.url}
                type="button"
                onClick={() => onExample(ex.url)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2 decoration-white/20"
              >
                {ex.name}
              </button>
            ))}
          </div>

          {/* Error messages */}
          {err && <p className="mt-3 text-sm text-rose-400">{err}</p>}
          {limitMsg && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
              <span>{limitMsg}</span>
              <button type="button" onClick={onUpgrade} className="underline hover:text-amber-300 transition-colors">
                {labels.upgrade}
              </button>
            </div>
          )}
          {authMsg && (
            <p className="mt-3 text-sm text-blue-400">
              {authMsg}{" "}
              <Link href="/sign-in" className="underline hover:text-blue-300 transition-colors">
                {signInLabel}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
