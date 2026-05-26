import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module before importing auth
vi.mock("@/lib/tiktok-adgen/db", () => ({
  getUsage: vi.fn(() => ({ used: 0 })),
  recordUsage: vi.fn(),
  getOrCreateUser: vi.fn(),
  updateUser: vi.fn(),
}));

describe("auth module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkUsage", () => {
    it("allows generation for free plan under limit", async () => {
      const { getUsage } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(getUsage).mockReturnValue({ used: 0 });

      const { checkUsage } = await import("@/lib/tiktok-adgen/auth");
      const result = checkUsage("user1", "free");

      expect(result.allowed).toBe(true);
      expect(result.snapshot.limit).toBe(3);
      expect(result.snapshot.remaining).toBe(3);
      expect(result.snapshot.plan).toBe("free");
    });

    it("blocks generation when free plan limit reached", async () => {
      const { getUsage } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(getUsage).mockReturnValue({ used: 3 });

      const { checkUsage } = await import("@/lib/tiktok-adgen/auth");
      const result = checkUsage("user1", "free");

      expect(result.allowed).toBe(false);
      expect(result.snapshot.remaining).toBe(0);
    });

    it("allows unlimited for pro plan", async () => {
      const { getUsage } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(getUsage).mockReturnValue({ used: 100 });

      const { checkUsage } = await import("@/lib/tiktok-adgen/auth");
      const result = checkUsage("user1", "pro");

      expect(result.allowed).toBe(true);
      expect(result.snapshot.remaining).toBe(-1);
      expect(result.snapshot.limit).toBe(-1);
    });

    it("allows unlimited for team plan", async () => {
      const { getUsage } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(getUsage).mockReturnValue({ used: 999 });

      const { checkUsage } = await import("@/lib/tiktok-adgen/auth");
      const result = checkUsage("user1", "team");

      expect(result.allowed).toBe(true);
      expect(result.snapshot.remaining).toBe(-1);
    });

    it("calculates remaining correctly for partial usage", async () => {
      const { getUsage } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(getUsage).mockReturnValue({ used: 1 });

      const { checkUsage } = await import("@/lib/tiktok-adgen/auth");
      const result = checkUsage("user1", "free");

      expect(result.allowed).toBe(true);
      expect(result.snapshot.remaining).toBe(2);
    });

    it("defaults to free plan when plan not specified", async () => {
      const { getUsage } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(getUsage).mockReturnValue({ used: 0 });

      const { checkUsage } = await import("@/lib/tiktok-adgen/auth");
      const result = checkUsage("user1");

      expect(result.snapshot.plan).toBe("free");
      expect(result.snapshot.limit).toBe(3);
    });
  });

  describe("generateApiKey", () => {
    it("generates a key starting with tk_", async () => {
      const { generateApiKey } = await import("@/lib/tiktok-adgen/auth");
      const key = generateApiKey();

      expect(key).toMatch(/^tk_[a-f0-9]{48}$/);
    });

    it("generates unique keys", async () => {
      const { generateApiKey } = await import("@/lib/tiktok-adgen/auth");
      const key1 = generateApiKey();
      const key2 = generateApiKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe("recordGeneration", () => {
    it("calls recordUsage with userId", async () => {
      const { recordUsage } = await import("@/lib/tiktok-adgen/db");
      const { recordGeneration } = await import("@/lib/tiktok-adgen/auth");

      recordGeneration("user123");
      expect(recordUsage).toHaveBeenCalledWith("user123");
    });
  });
});
