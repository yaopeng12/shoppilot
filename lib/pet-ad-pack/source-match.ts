import type { Product } from "@/lib/tiktok-adgen/types";
import type { PetCleaningScenario, ScoreBreakdown, SourceCandidate } from "./types";
import { SOURCE_CATALOG } from "./templates";

const SCENARIO_KEYWORDS: Record<PetCleaningScenario, string[]> = {
  cat_litter_odor: ["cat litter", "litter box", "deodor", "odor", "smell", "fresh", "toilet"],
  cat_urine_cleanup: ["cat urine", "urine", "pee", "enzyme", "stain", "accident", "spray"],
  litter_tracking: ["litter mat", "tracking", "floor", "honeycomb", "scatter", "catcher"],
  pet_hair_cleanup: ["hair", "fur", "lint", "shedding", "sofa", "clothes", "brush", "roller"],
  fabric_odor: ["fabric", "sofa", "pet bed", "couch", "room", "odor", "deodorizer"],
  dog_pad_floor: ["dog", "puppy", "pad", "floor", "pee pad", "training", "urine"],
  auto_litter_box: ["automatic", "self-cleaning", "smart", "auto", "robot", "litter box", "app"],
  pet_bathing: ["bath", "shampoo", "grooming", "wash", "brush", "shower", "drying"],
  paw_cleanup: ["paw", "muddy", "washer", "cleaner cup", "outdoor", "walk", "wipe"],
  pet_stain_removal: ["carpet", "stain", "remover", "upholstery", "rug", "spot", "treatment"],
  aquarium_cleaning: ["aquarium", "fish tank", "algae", "water", "filter", "aquatic"],
  pet_toys_cleaning: ["toy", "sanitizer", "hygiene", "clean", "chew", "disinfect"],
};

const scenarioLabels: Record<PetCleaningScenario, string> = {
  cat_litter_odor: "cat litter odor control",
  cat_urine_cleanup: "cat urine cleanup",
  litter_tracking: "cat litter tracking",
  pet_hair_cleanup: "pet hair cleanup",
  fabric_odor: "fabric and sofa odor",
  dog_pad_floor: "dog pad and floor cleanup",
  auto_litter_box: "automatic litter box",
  pet_bathing: "pet bathing and grooming",
  paw_cleanup: "paw cleanup",
  pet_stain_removal: "pet stain removal",
  aquarium_cleaning: "aquarium cleaning",
  pet_toys_cleaning: "pet toys cleaning",
};

function productText(product: Product, note?: string) {
  return [product.title, product.description, product.tags?.join(" "), note]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function keywordScore(text: string, keywords: string[]) {
  const hits = keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length;
  return clampScore((hits / Math.max(1, Math.min(keywords.length, 5))) * 100);
}

export function detectScenario(product: Product, note?: string): PetCleaningScenario {
  const text = productText(product, note);
  const ranked = (Object.entries(SCENARIO_KEYWORDS) as Array<[PetCleaningScenario, string[]]>)
    .map(([scenario, keywords]) => ({
      scenario,
      score: keywordScore(text, keywords),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score > 0 ? ranked[0].scenario : "cat_litter_odor";
}

export function getScenarioLabel(scenario: PetCleaningScenario) {
  return scenarioLabels[scenario];
}

export function scoreCandidate(product: Product, candidate: SourceCandidate, note?: string): SourceCandidate {
  const text = productText(product, note);
  const scenario = detectScenario(product, note);
  const scenarioKeywordScore = keywordScore(text, SCENARIO_KEYWORDS[candidate.scenario]);
  const candidateKeywordScore = keywordScore(text, candidate.keywords);
  const scenarioBoost = candidate.scenario === scenario ? 100 : 58;
  const productMatch = clampScore(candidateKeywordScore * 0.55 + scenarioKeywordScore * 0.2 + scenarioBoost * 0.25);
  const scenarioDemand = clampScore(candidate.monthlyOrderIndex * 0.65 + candidate.repeatPurchaseIndex * 0.35);
  const supplierQuality = clampScore((candidate.supplierRating / 5) * 100);
  const grossMargin = ((candidate.suggestedRetailUsd * 7.2 - candidate.estimatedPriceCny) / Math.max(1, candidate.suggestedRetailUsd * 7.2)) * 100;
  const marginPotential = clampScore(grossMargin);
  const videoDemoPotential = clampScore(candidate.visualDemoScore);
  const complianceSafety = candidate.complianceRisk === "low" ? 92 : candidate.complianceRisk === "medium" ? 72 : 45;

  const breakdown: ScoreBreakdown = {
    productMatch,
    scenarioDemand,
    supplierQuality,
    marginPotential,
    videoDemoPotential,
    complianceSafety,
  };

  const score = clampScore(
    productMatch * 0.34 +
      scenarioDemand * 0.18 +
      supplierQuality * 0.14 +
      marginPotential * 0.14 +
      videoDemoPotential * 0.14 +
      complianceSafety * 0.06,
  );

  return {
    ...candidate,
    score,
    scoreBreakdown: breakdown,
  };
}

export function matchBestSource(product: Product, note?: string) {
  const candidates = SOURCE_CATALOG.map((candidate) => scoreCandidate(product, candidate, note)).sort(
    (a, b) => (b.score || 0) - (a.score || 0),
  );

  return {
    selected: candidates[0],
    alternatives: candidates.slice(1, 4),
    candidates,
    detectedScenario: detectScenario(product, note),
  };
}
