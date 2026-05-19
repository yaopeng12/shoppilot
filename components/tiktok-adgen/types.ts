import type { PlanId, Product, UsageSnapshot } from "@/lib/tiktok-adgen/types";

export type { Product };
export type ResultTab = "hooks" | "scripts" | "voiceovers" | "subtitles";

export type Script = {
  id: number;
  scenes: { text: string; duration?: string; time?: string }[];
};

export type SubtitleRow = { time: string; text: string };

export type GeneratedData = {
  product: Product;
  hooks: string[];
  scripts: Script[];
  voiceovers: string[];
  subtitles: SubtitleRow[][];
  _usage?: UsageSnapshot;
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
