import { describe, it, expect } from "vitest";
import { cn } from "@/components/ui/cn";
import {
  normalizeUrl,
  formatSecondsToSrtTime,
  subtitlesToSrt,
  buildFullExport,
} from "@/components/tiktok-adgen/utils";
import type { GeneratedData } from "@/components/tiktok-adgen/types";

// ─── cn() ───────────────────────────────────────────────────────────
describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string for all falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("handles single class", () => {
    expect(cn("only")).toBe("only");
  });
});

// ─── normalizeUrl() ─────────────────────────────────────────────────
describe("normalizeUrl", () => {
  it("adds https:// if missing", () => {
    expect(normalizeUrl("example.com/products/1")).toBe("https://example.com/products/1");
  });

  it("preserves existing https://", () => {
    expect(normalizeUrl("https://example.com/products/1")).toBe("https://example.com/products/1");
  });

  it("preserves existing http://", () => {
    expect(normalizeUrl("http://example.com/products/1")).toBe("http://example.com/products/1");
  });

  it("trims whitespace", () => {
    expect(normalizeUrl("  https://example.com  ")).toBe("https://example.com");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl("   ")).toBe("");
  });
});

// ─── formatSecondsToSrtTime() ───────────────────────────────────────
describe("formatSecondsToSrtTime", () => {
  it("formats 0 seconds", () => {
    expect(formatSecondsToSrtTime(0)).toBe("00:00:00,000");
  });

  it("formats seconds only", () => {
    expect(formatSecondsToSrtTime(5)).toBe("00:00:05,000");
  });

  it("formats minutes and seconds", () => {
    expect(formatSecondsToSrtTime(65)).toBe("00:01:05,000");
  });

  it("formats hours", () => {
    expect(formatSecondsToSrtTime(3661)).toBe("01:01:01,000");
  });

  it("handles milliseconds", () => {
    expect(formatSecondsToSrtTime(1.5)).toBe("00:00:01,500");
  });
});

// ─── subtitlesToSrt() ──────────────────────────────────────────────
describe("subtitlesToSrt", () => {
  it("converts subtitle rows to SRT format", () => {
    const subs = [
      { time: "0s - 2s", text: "Hello" },
      { time: "2s - 4s", text: "World" },
    ];
    const result = subtitlesToSrt(subs);
    expect(result).toContain("1\n00:00:00,000 --> 00:00:02,000\nHello");
    expect(result).toContain("2\n00:00:02,000 --> 00:00:04,000\nWorld");
  });

  it("returns empty string for empty input", () => {
    expect(subtitlesToSrt([])).toBe("");
  });
});

// ─── buildFullExport() ──────────────────────────────────────────────
describe("buildFullExport", () => {
  const mockData: GeneratedData = {
    product: { title: "Test Product", description: "A test", price: "$29", images: [], tags: [] },
    hooks: ["Hook 1", "Hook 2"],
    scripts: [
      {
        id: 1,
        scenes: [
          { time: "0-3s", text: "Opening scene" },
          { time: "3-8s", text: "Main scene" },
        ],
      },
    ],
    voiceovers: ["Voiceover text here"],
    subtitles: [
      [
        { time: "0s - 2s", text: "Sub 1" },
        { time: "2s - 4s", text: "Sub 2" },
      ],
    ],
  };

  it("includes product title", () => {
    expect(buildFullExport(mockData)).toContain("Test Product");
  });

  it("includes all hooks", () => {
    const result = buildFullExport(mockData);
    expect(result).toContain("1. Hook 1");
    expect(result).toContain("2. Hook 2");
  });

  it("includes script scenes", () => {
    const result = buildFullExport(mockData);
    expect(result).toContain("[0-3s] Opening scene");
    expect(result).toContain("[3-8s] Main scene");
  });

  it("includes voiceovers", () => {
    expect(buildFullExport(mockData)).toContain("Voiceover text here");
  });
});
