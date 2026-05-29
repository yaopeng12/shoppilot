import { describe, it, expect } from "vitest";
import { PLANS, type PlanId } from "@/lib/tiktok-adgen/types";

describe("PLANS constant", () => {
  it("has exactly 2 plans", () => {
    expect(Object.keys(PLANS)).toHaveLength(2);
    expect(PLANS).toHaveProperty("free");
    expect(PLANS).toHaveProperty("pro");
  });

  it("free plan has correct structure", () => {
    expect(PLANS.free.name).toBe("Free");
    expect(PLANS.free.dailyLimit).toBe(3);
    expect(PLANS.free.price).toBe(0);
    expect(PLANS.free.features.length).toBeGreaterThan(0);
  });

  it("pro plan has correct structure", () => {
    expect(PLANS.pro.name).toBe("Pro");
    expect(PLANS.pro.dailyLimit).toBe(-1);
    expect(PLANS.pro.price).toBe(9.9);
    expect(PLANS.pro.features.length).toBeGreaterThan(PLANS.free.features.length);
  });

  it("all plans have name, dailyLimit, price, features", () => {
    for (const plan of Object.values(PLANS)) {
      expect(plan).toHaveProperty("name");
      expect(plan).toHaveProperty("dailyLimit");
      expect(plan).toHaveProperty("price");
      expect(plan).toHaveProperty("features");
      expect(typeof plan.name).toBe("string");
      expect(typeof plan.dailyLimit).toBe("number");
      expect(typeof plan.price).toBe("number");
      expect(Array.isArray(plan.features)).toBe(true);
    }
  });

  it("free plan daily limit is positive", () => {
    expect(PLANS.free.dailyLimit).toBeGreaterThan(0);
  });

  it("paid plan has unlimited (-1) daily limit", () => {
    expect(PLANS.pro.dailyLimit).toBe(-1);
  });

  it("prices are non-negative and increase from free to pro", () => {
    expect(PLANS.free.price).toBe(0);
    expect(PLANS.pro.price).toBeGreaterThan(PLANS.free.price);
  });
});

describe("http helper", () => {
  it("json() creates a response with correct status and headers", async () => {
    const { json } = await import("@/lib/tiktok-adgen/http");
    const res = json(200, { ok: true });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");

    const data = await res.json();
    expect(data).toEqual({ ok: true });
  });

  it("json() supports error status codes", async () => {
    const { json } = await import("@/lib/tiktok-adgen/http");

    const res401 = json(401, { error: "Unauthorized" });
    expect(res401.status).toBe(401);

    const res429 = json(429, { error: "Rate limited" });
    expect(res429.status).toBe(429);

    const res500 = json(500, { error: "Internal error" });
    expect(res500.status).toBe(500);
  });
});

describe("client apiFetch", () => {
  it("exports apiFetch function", async () => {
    const mod = await import("@/lib/tiktok-adgen/client");
    expect(typeof mod.apiFetch).toBe("function");
  });
});
