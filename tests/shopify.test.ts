import { describe, it, expect, vi } from "vitest";

describe("shopify fetchProduct", () => {
  it("exports fetchProduct function", async () => {
    const mod = await import("@/lib/tiktok-adgen/shopify");
    expect(typeof mod.fetchProduct).toBe("function");
  });

  it("throws on invalid URL", async () => {
    const { fetchProduct } = await import("@/lib/tiktok-adgen/shopify");
    await expect(fetchProduct("not-a-url")).rejects.toThrow();
  });

  it("normalizes URL without protocol", async () => {
    // This will fail the fetch but should not throw on URL parsing
    const { fetchProduct } = await import("@/lib/tiktok-adgen/shopify");
    try {
      await fetchProduct("invalid-domain-xyz.com/products/test");
    } catch (e: any) {
      // Expected to fail on network, not on URL parsing
      expect(e.message).not.toContain("Invalid URL");
    }
  });
});
