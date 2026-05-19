import { describe, it, expect } from "vitest";
import en from "@/lib/i18n/en";
import zh from "@/lib/i18n/zh";

function getKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
      keys.push(...getKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

describe("i18n translations", () => {
  it("en and zh have the same top-level sections", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
  });

  it("en and zh have the same leaf keys", () => {
    const enKeys = getKeys(en).sort();
    const zhKeys = getKeys(zh).sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it("no empty string values in en", () => {
    const keys = getKeys(en);
    for (const key of keys) {
      const val = key.split(".").reduce((o: any, k) => o[k], en);
      if (typeof val === "string") {
        expect(val.length, `en.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it("no empty string values in zh", () => {
    const keys = getKeys(zh);
    for (const key of keys) {
      const val = key.split(".").reduce((o: any, k) => o[k], zh);
      if (typeof val === "string") {
        expect(val.length, `zh.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it("en and zh arrays have the same length", () => {
    expect(en.benefits.items).toHaveLength(zh.benefits.items.length);
    expect(en.features.items).toHaveLength(zh.features.items.length);
    expect(en.metrics.items).toHaveLength(zh.metrics.items.length);
    expect(en.demo.tabs).toHaveLength(zh.demo.tabs.length);
  });

  it("nav section has all required keys", () => {
    const navKeys = ["home", "product", "pricing", "dashboard", "login"];
    navKeys.forEach((k) => {
      expect(en.nav).toHaveProperty(k);
      expect(zh.nav).toHaveProperty(k);
    });
  });

  it("hero section has all required keys", () => {
    const heroKeys = ["badge", "title1", "title2", "desc", "cta", "demo"];
    heroKeys.forEach((k) => {
      expect(en.hero).toHaveProperty(k);
      expect(zh.hero).toHaveProperty(k);
    });
  });

  it("pricing section has all required keys", () => {
    const pricingKeys = [
      "badge", "title", "desc", "monthly", "yearly",
      "currentPlan", "upgradeTo", "freeStart", "perMonth",
      "billedMonthly", "billedYearly", "popular", "yearlyDiscount",
    ];
    pricingKeys.forEach((k) => {
      expect(en.pricing).toHaveProperty(k);
      expect(zh.pricing).toHaveProperty(k);
    });
  });

  it("footer section has all required keys", () => {
    const footerKeys = ["slogan", "company", "contactUs", "followUs", "legal", "privacy", "terms", "copyright"];
    footerKeys.forEach((k) => {
      expect(en.footer).toHaveProperty(k);
      expect(zh.footer).toHaveProperty(k);
    });
  });
});
