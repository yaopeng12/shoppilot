import { describe, expect, it } from "vitest";
import { detectScenario, matchBestSource, scoreCandidate } from "@/lib/pet-ad-pack/source-match";
import { generate1688SearchUrls, generateMock1688Products } from "@/lib/pet-ad-pack/ali1688";
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

  it("ranks 1688 products using the selected source and product signal", () => {
    const matched = matchBestSource(litterMatProduct);
    const products = generateMock1688Products(matched.detectedScenario, 3, {
      product: litterMatProduct,
      source: matched.selected,
      note: "cat litter tracking and honeycomb mat",
    });

    expect(products[0].title).toContain("猫砂垫");
    expect(products[0].matchScore).toBeGreaterThan(70);
    expect(products[0].grossMarginPercent).toBeGreaterThan(0);
    expect(products[0].sourcingTips.length).toBeGreaterThan(0);
    expect(products[0].searchKeywords.length).toBeGreaterThan(0);
    expect(products[0].productUrl).toContain("s.1688.com");
  });

  it("generates 1688 search links from source type before broad scenario terms", () => {
    const matched = matchBestSource(litterMatProduct);
    const urls = generate1688SearchUrls(matched.detectedScenario, matched.selected, litterMatProduct);

    expect(urls[0].keyword).toContain("猫砂垫");
    expect(urls[0].url).toContain("keywords=");
  });
});
