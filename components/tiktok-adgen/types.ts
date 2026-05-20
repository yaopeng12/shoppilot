import type { PlanId, Product, UsageSnapshot } from "@/lib/tiktok-adgen/types";

export type { Product };
export type ResultTab = "hooks" | "scripts" | "voiceovers" | "subtitles";

export type Script = {
  id: number;
  style?: string;
  hook?: { text: string; type: string };
  scenes: { text: string; time?: string; action?: string }[];
  cta?: { text: string; type: string };
  tone_notes?: string;
  filming_tips?: string;
  bgm_suggestion?: string;
};

export type SubtitleRow = { time: string; text: string };

export type GeneratedData = {
  product: Product;
  hooks: string[];
  scripts: Script[];
  voiceovers: string[];
  subtitles: SubtitleRow[][];
  hashtags?: string[];
  _usage?: UsageSnapshot;
  _category?: string | null;
};

export type TeamMember = { id: string; name: string; email: string; plan: string };

export type TeamState =
  | { _empty: true }
  | {
      id: string;
      name: string;
      members: string[];
      memberDetails?: TeamMember[];
    }
  | null;

export type GenerateErrorBody = { error?: string; message?: string };
