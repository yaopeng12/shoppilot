import { describe, it, expect, vi, beforeEach } from "vitest";
// Mock OpenAI to prevent constructor from throwing
vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: vi.fn() } };
  },
}));

// Mock Auth.js before importing routes
vi.mock("@/auth", () => ({
  auth: vi.fn(() => null),
}));

vi.mock("@/lib/tiktok-adgen/db", () => ({
  getUsage: vi.fn(() => ({ used: 0 })),
  recordUsage: vi.fn(),
  getOrCreateUser: vi.fn((id: string, email: string, name: string, image?: string) => ({
    id,
    email,
    name,
    image,
    plan: "free",
    apiKey: "tk_test",
    createdAt: "2026-01-01T00:00:00.000Z",
  })),
  getUser: vi.fn(() => ({
    id: "user123",
    email: "test@test.com",
    name: "Test",
    plan: "free",
    apiKey: "tk_test",
    createdAt: "2026-01-01T00:00:00.000Z",
  })),
  updateUser: vi.fn((id: string, updates: Record<string, unknown>) => ({
    id,
    email: "test@test.com",
    name: "Test",
    plan: updates.plan || "free",
    apiKey: updates.apiKey || "tk_test",
    createdAt: "2026-01-01T00:00:00.000Z",
  })),
}));

vi.mock("@/lib/tiktok-adgen/shopify", () => ({
  fetchProduct: vi.fn(),
}));

const mockSession = {
  user: { id: "user123", email: "test@test.com", name: "Test" },
};

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
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(null as any);

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
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession as any);

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
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession as any);

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
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession as any);

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
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(null as any);

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
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession as any);

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
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession as any);

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
      const { auth } = await import("@/auth");
      const { updateUser } = await import("@/lib/tiktok-adgen/db");
      vi.mocked(auth).mockResolvedValue(mockSession as any);

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
      expect(updateUser).toHaveBeenCalledWith("user123", { plan: "pro" });
    });
  });

  describe("GET /api/team/[action]", () => {
    it("returns 401 when not authenticated", async () => {
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(null as any);

      const { GET } = await import("@/app/api/team/[action]/route");
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(401);
    });

    it("returns team state for authenticated user", async () => {
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const { GET } = await import("@/app/api/team/[action]/route");
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("_empty", true);
    });

    it("POST returns 501 (not implemented)", async () => {
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const { POST } = await import("@/app/api/team/[action]/route");
      const res = await POST();
      const data = await res.json();

      expect(res.status).toBe(501);
    });
  });
});
