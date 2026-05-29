import { describe, expect, it } from "vitest";

import { inferProductMarketPlaybook, inferVideoMarketPlaybook } from "@/lib/inspiration/market-intelligence";
import type { TrendingVideo } from "@/lib/inspiration/types";

const baseVideo: TrendingVideo = {
  id: "video-1",
  video_url: "https://www.tiktok.com/@creator/video/1",
  thumbnail_url: null,
  title: "Small flat pet cleanup routine sorted",
  author_name: "pettokuk",
  author_avatar: null,
  product_category: "pet_hair_remover",
  view_count: 100000,
  like_count: 9000,
  comment_count: 300,
  share_count: 500,
  country_code: "GB",
  hashtags: ["PetTokUK", "CleanTokUK"],
  duration_seconds: 24,
  scraped_at: new Date().toISOString(),
  source_period: "test",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("market intelligence", () => {
  it("detects the strongest playback market from video region and text signals", () => {
    const playbook = inferVideoMarketPlaybook(baseVideo, "en-US");

    expect(playbook.primaryMarket).toBe("en-GB");
    expect(playbook.marketScores[0].score).toBeGreaterThan(playbook.marketScores[1].score);
    expect(playbook.hookAngle.length).toBeGreaterThan(0);
  });

  it("uses the selected generation market for product ad packs", () => {
    const playbook = inferProductMarketPlaybook(
      { title: "Cat litter deodorizer", description: "Pet odor control", price: "$19", images: [], tags: ["cat_litter"] },
      "ja",
    );

    expect(playbook.primaryMarket).toBe("ja");
    expect(playbook.primaryMarketLabel).toBe("Japan");
    expect(playbook.creativeNotes.length).toBeGreaterThan(0);
  });
});
