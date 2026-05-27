import { describe, expect, it } from "vitest";
import { detectScenario, matchBestSource, scoreCandidate } from "@/lib/pet-ad-pack/source-match";
import { SOURCE_CATALOG } from "@/lib/pet-ad-pack/templates";
import type { Product } from "@/lib/tiktok-adgen/types";

const litterMatProduct: Product = {
  title: "Double Layer Cat Litter Mat",
  description: "Honeycomb mat catches litter tracking from the litter box and keeps floors cleaner.",
  price: "$24.99",
  images: [],
  tags: ["cat litter", "mat", "floor"],
};

describe("pet ad pack source matching", () => {
  it("detects the litter tracking scenario from product text", () => {
    expect(detectScenario(litterMatProduct)).toBe("litter_tracking");
  });

  it("selects the most relevant source candidate", () => {
    const matched = matchBestSource(litterMatProduct);

    expect(matched.selected.id).toBe("double-layer-litter-mat");
    expect(matched.selected.score).toBeGreaterThan(80);
    expect(matched.alternatives.length).toBeGreaterThan(0);
  });

  it("adds a complete score breakdown", () => {
    const candidate = scoreCandidate(litterMatProduct, SOURCE_CATALOG[0]);

    expect(candidate.score).toBeGreaterThan(0);
    expect(candidate.scoreBreakdown).toHaveProperty("productMatch");
    expect(candidate.scoreBreakdown).toHaveProperty("videoDemoPotential");
  });
});
