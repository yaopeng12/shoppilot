import type { Product, UsageSnapshot } from "@/lib/tiktok-adgen/types";
import type { MarketProfile, TargetMarketCode } from "@/lib/localization/markets";

export type PetCleaningScenario =
  | "cat_litter_odor"
  | "cat_urine_cleanup"
  | "litter_tracking"
  | "pet_hair_cleanup"
  | "fabric_odor"
  | "dog_pad_floor";

export type PetTargetMarket = TargetMarketCode;

export type ScoreBreakdown = {
  productMatch: number;
  scenarioDemand: number;
  supplierQuality: number;
  marginPotential: number;
  videoDemoPotential: number;
  complianceSafety: number;
};

export type SourceCandidate = {
  id: string;
  title: string;
  productType: string;
  scenario: PetCleaningScenario;
  estimatedPriceCny: number;
  suggestedRetailUsd: number;
  monthlyOrderIndex: number;
  supplierRating: number;
  repeatPurchaseIndex: number;
  visualDemoScore: number;
  complianceRisk: "low" | "medium" | "high";
  keywords: string[];
  searchUrl: string;
  reasons: string[];
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
};

export type PetTemplate = {
  id: string;
  name: string;
  scenario: PetCleaningScenario;
  format: string;
  opening: string;
  structure: string[];
  bestFor: string[];
  riskNotes: string[];
};

export type AdPackScene = {
  time: string;
  objective: string;
  visual: string;
  overlay: string;
  narration: string;
};

export type AdPackScript = {
  id: string;
  name: string;
  duration: string;
  hook: string;
  scenes: AdPackScene[];
  cta: string;
  tone: string;
};

export type PetAdPack = {
  product: Product;
  targetMarket: PetTargetMarket;
  localization: MarketProfile;
  detectedScenario: PetCleaningScenario;
  selectedSource: SourceCandidate;
  alternatives: SourceCandidate[];
  selectedTemplate: PetTemplate;
  strategy: {
    positioning: string;
    targetAudience: string;
    corePainPoint: string;
    productPromise: string;
    proofAngle: string;
    offerAngle: string;
  };
  hooks: string[];
  scripts: AdPackScript[];
  storyboard: AdPackScene[];
  shotList: string[];
  captions: string[];
  voiceover: string;
  aiVideoPrompts: string[];
  compliance: {
    safeClaims: string[];
    avoidClaims: string[];
    saferPhrases: string[];
  };
  testingPlan: Array<{
    variant: string;
    change: string;
    successMetric: string;
  }>;
  _usage?: UsageSnapshot;
};

export type PetAdPackOptions = {
  targetMarket?: PetTargetMarket | string;
  userNote?: string;
};
