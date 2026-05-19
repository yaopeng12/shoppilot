import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Product } from "@/lib/tiktok-adgen/types";

// Create hoisted mock function that can be referenced in vi.mock factory
const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

// Mock OpenAI at top level
vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: mockCreate } };
  },
}));

const mockProduct: Product = {
  title: "Wireless Earbuds Pro",
  description: "Premium noise-cancelling wireless earbuds with 30hr battery",
  price: "$49.99",
  images: ["https://example.com/img1.jpg"],
  tags: ["electronics", "audio"],
};

describe("generator", () => {
  const originalEnv = process.env.DASHSCOPE_API_KEY;

  afterEach(() => {
    process.env.DASHSCOPE_API_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  describe("generateAll (fallback mode — no API key)", () => {
    beforeEach(() => {
      process.env.DASHSCOPE_API_KEY = "";
      mockCreate.mockReset();
    });

    it("returns fallback data with all required fields", async () => {
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result).toHaveProperty("product", mockProduct);
      expect(result).toHaveProperty("hooks");
      expect(result).toHaveProperty("scripts");
      expect(result).toHaveProperty("voiceovers");
      expect(result).toHaveProperty("subtitles");
    });

    it("returns exactly 5 hooks", async () => {
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result.hooks).toHaveLength(5);
      result.hooks.forEach((h) => {
        expect(typeof h).toBe("string");
        expect(h.length).toBeGreaterThan(0);
      });
    });

    it("returns 2 scripts with 5 scenes each", async () => {
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result.scripts).toHaveLength(2);
      result.scripts.forEach((s) => {
        expect(s.scenes).toHaveLength(5);
        s.scenes.forEach((sc) => {
          expect(sc).toHaveProperty("time");
          expect(sc).toHaveProperty("text");
        });
      });
    });

    it("returns 2 voiceovers", async () => {
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result.voiceovers).toHaveLength(2);
      result.voiceovers.forEach((v) => {
        expect(typeof v).toBe("string");
        expect(v.length).toBeGreaterThan(50);
      });
    });

    it("returns subtitle arrays", async () => {
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result.subtitles.length).toBeGreaterThanOrEqual(1);
      result.subtitles.forEach((set) => {
        expect(set.length).toBeGreaterThanOrEqual(1);
        set.forEach((s) => {
          expect(s).toHaveProperty("time");
          expect(s).toHaveProperty("text");
        });
      });
    });

    it("includes product name in hooks", async () => {
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      const hasProductName = result.hooks.some(
        (h) => h.toLowerCase().includes("wireless earbuds pro") || h.toLowerCase().includes("earbuds")
      );
      expect(hasProductName).toBe(true);
    });

    it("handles product with empty fields gracefully", async () => {
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const emptyProduct: Product = { title: "", description: "", price: "", images: [], tags: [] };
      const result = await generateAll(emptyProduct);

      expect(result.hooks).toHaveLength(5);
      expect(result.scripts).toHaveLength(2);
      expect(result.voiceovers).toHaveLength(2);
    });
  });

  describe("generateAll (AI mode — with API key)", () => {
    beforeEach(() => {
      process.env.DASHSCOPE_API_KEY = "sk-test-key";
      mockCreate.mockReset();
    });

    it("returns AI-generated content when API succeeds", async () => {
      const aiResponse = {
        hooks: ["AI Hook 1", "AI Hook 2", "AI Hook 3", "AI Hook 4", "AI Hook 5"],
        scripts: [
          { scenes: [{ time: "0-3s", text: "Scene 1" }, { time: "3-8s", text: "Scene 2" }] },
          { scenes: [{ time: "0-3s", text: "Scene A" }, { time: "3-8s", text: "Scene B" }] },
        ],
        voiceovers: [
          "AI voiceover 1 with enough text to be realistic and long enough for the test to pass the length check",
          "AI voiceover 2 with enough text to be realistic and long enough for the test to pass the length check",
        ],
        subtitles: [
          [{ time: "0s - 2s", text: "Sub 1" }],
          [{ time: "0s - 2s", text: "Sub A" }],
        ],
      };

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(aiResponse) } }],
      });

      // Reset modules to get a fresh generator with our mock
      vi.resetModules();
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result.hooks).toEqual(aiResponse.hooks);
      expect(result.scripts).toHaveLength(2);
      expect(result.voiceovers).toHaveLength(2);
    });

    it("falls back to templates when API returns invalid JSON", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "not json at all" } }],
      });

      vi.resetModules();
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result.hooks).toHaveLength(5);
      expect(result.scripts).toHaveLength(2);
    });

    it("falls back to templates when API throws error", async () => {
      mockCreate.mockRejectedValue(new Error("API error"));

      vi.resetModules();
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result.hooks).toHaveLength(5);
      expect(result.scripts).toHaveLength(2);
    });

    it("parses JSON from markdown code fences", async () => {
      const aiResponse = {
        hooks: ["Hook A", "Hook B", "Hook C", "Hook D", "Hook E"],
        scripts: [
          { scenes: [{ time: "0-3s", text: "S1" }] },
          { scenes: [{ time: "0-3s", text: "S2" }] },
        ],
        voiceovers: [
          "Voiceover text that is long enough to pass the length validation check in the test suite",
          "Another voiceover text that is long enough to pass the length validation check in the test suite",
        ],
        subtitles: [[{ time: "0s - 2s", text: "Sub" }]],
      };

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "```json\n" + JSON.stringify(aiResponse) + "\n```" } }],
      });

      vi.resetModules();
      const { generateAll } = await import("@/lib/tiktok-adgen/generator");
      const result = await generateAll(mockProduct);

      expect(result.hooks).toEqual(aiResponse.hooks);
    });
  });
});
