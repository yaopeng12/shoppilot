import { describe, it, expect, vi, beforeEach } from "vitest";
import { PLANS } from "@/lib/tiktok-adgen/types";

// Mock OpenAI to prevent constructor from throwing
vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: vi.fn() } };
  },
}));

// Mock Clerk before importing routes
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => ({ userId: null })),
  currentUser: vi.fn(() => null),
  clerkClient: vi.fn(),
}));

vi.mock("@/lib/tiktok-adgen/db", () => ({
  getUsage: vi.fn(() => ({ used: 0 })),
  recordUsage: vi.fn(),
}));

vi.mock("@/lib/tiktok-adgen/shopify", () => ({
  fetchProduct: vi.fn(),
}));

describe("API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/plans", () => {
    it("returns all plans", async () => {
      const { GET } = await import("@/app/api/plans/route");
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("free");
      expect(data).toHaveProperty("pro");
      expect(data).toHaveProperty("team");
    });

    it("free plan has daily limit of 3", async () => {
      const { GET } = await import("@/app/api/plans/route");
      const res = await GET();
      const data = await res.json();

      expect(data.free.dailyLimit).toBe(3);
      expect(data.free.price).toBe(0);
    });

    it("pro plan has unlimited generations", async () => {
      const { GET } = await import("@/app/api/plans/route");
      const res = await GET();
      const data = await res.json();

      expect(data.pro.dailyLimit).toBe(-1);
      expect(data.pro.price).toBe(19);
    });

    it("team plan has unlimited generations", async () => {
      const { GET } = await import("@/app/api/plans/route");
      const res = await GET();
      const data = await res.json();

      expect(data.team.dailyLimit).toBe(-1);
      expect(data.team.price).toBe(49);
    });
  });

  describe("POST /api/generate", () => {
    it("returns 401 when not authenticated", async () => {
      const { auth } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const { POST } = await import("@/app/api/generate/route");
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com/products/1" }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("auth_required");
    });

    it("returns 400 when URL is missing", async () => {
      const { auth, currentUser, clerkClient } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);
      vi.mocked(currentUser).mockResolvedValue({
        id: "user123",
        emailAddresses: [{ emailAddress: "test@test.com" }],
        firstName: "Test",
        publicMetadata: { plan: "free" },
        privateMetadata: { apiKey: "tk_test" },
      } as any);
      vi.mocked(clerkClient).mockResolvedValue({
        users: { updateUserMetadata: vi.fn() },
      } as any);

      const { POST } = await import("@/app/api/generate/route");
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("URL is required");
    });

    it("returns 429 when daily limit reached", async () => {
      const { auth, currentUser, clerkClient } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);
      vi.mocked(currentUser).mockResolvedValue({
        id: "user123",
        emailAddresses: [{ emailAddress: "test@test.com" }],
        firstName: "Test",
        publicMetadata: { plan: "free" },
        privateMetadata: { apiKey: "tk_test" },
      } as any);
      vi.mocked(clerkClient).mockResolvedValue({
        users: { updateUserMetadata: vi.fn() },
      } as any);

      const { getUsage } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(getUsage).mockReturnValue({ used: 3 }); // limit reached

      const { POST } = await import("@/app/api/generate/route");
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com/products/1" }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe("limit_reached");
    });

    it("generates content for authenticated user under limit", async () => {
      const { auth, currentUser, clerkClient } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);
      vi.mocked(currentUser).mockResolvedValue({
        id: "user123",
        emailAddresses: [{ emailAddress: "test@test.com" }],
        firstName: "Test",
        publicMetadata: { plan: "free" },
        privateMetadata: { apiKey: "tk_test" },
      } as any);
      vi.mocked(clerkClient).mockResolvedValue({
        users: { updateUserMetadata: vi.fn() },
      } as any);

      const { getUsage } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(getUsage).mockReturnValue({ used: 0 });

      const { fetchProduct } = await import("@/lib/tiktok-adgen/shopify");
      vi.mocked(fetchProduct).mockResolvedValue({
        title: "Test Product",
        description: "A test product",
        price: "$29",
        images: [],
        tags: [],
      });

      const { POST } = await import("@/app/api/generate/route");
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com/products/1" }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("hooks");
      expect(data).toHaveProperty("scripts");
      expect(data).toHaveProperty("voiceovers");
      expect(data).toHaveProperty("subtitles");
      expect(data).toHaveProperty("_usage");
    });
  });

  describe("POST /api/upgrade", () => {
    it("returns 401 when not authenticated", async () => {
      const { auth } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const { POST } = await import("@/app/api/upgrade/route");
      const req = new Request("http://localhost/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid plan", async () => {
      const { auth } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);

      const { POST } = await import("@/app/api/upgrade/route");
      const req = new Request("http://localhost/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "invalid" }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Invalid plan");
    });

    it("returns 400 when upgrading to free", async () => {
      const { auth } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);

      const { POST } = await import("@/app/api/upgrade/route");
      const req = new Request("http://localhost/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it("upgrades to pro plan successfully", async () => {
      const { auth, clerkClient } = await import("@clerk/nextjs/server");
      const mockUpdate = vi.fn();
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);
      vi.mocked(clerkClient).mockResolvedValue({
        users: { updateUserMetadata: mockUpdate },
      } as any);

      const { POST } = await import("@/app/api/upgrade/route");
      const req = new Request("http://localhost/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.plan).toBe("pro");
      expect(mockUpdate).toHaveBeenCalledWith("user123", {
        publicMetadata: { plan: "pro" },
      });
    });
  });

  describe("GET /api/team/[action]", () => {
    it("returns 401 when not authenticated", async () => {
      const { auth } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const { GET } = await import("@/app/api/team/[action]/route");
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(401);
    });

    it("returns team state for authenticated user", async () => {
      const { auth } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);

      const { GET } = await import("@/app/api/team/[action]/route");
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("_empty", true);
    });

    it("POST returns 501 (not implemented)", async () => {
      const { auth } = await import("@clerk/nextjs/server");
      vi.mocked(auth).mockResolvedValue({ userId: "user123" } as any);

      const { POST } = await import("@/app/api/team/[action]/route");
      const res = await POST();
      const data = await res.json();

      expect(res.status).toBe(501);
    });
  });
});
