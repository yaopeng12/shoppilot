import { describe, expect, it } from "vitest";

import { getKnowledgeBase } from "@/lib/inspiration/db";

describe("knowledge base market localization", () => {
  it("surfaces visibly different playbooks for different target markets", async () => {
    const [usEntries, jpEntries] = await Promise.all([getKnowledgeBase("en-US"), getKnowledgeBase("ja")]);

    expect(usEntries.length).toBeGreaterThan(0);
    expect(jpEntries.length).toBeGreaterThan(0);

    const usEntry = usEntries[0];
    const jpEntry = jpEntries[0];

    expect(usEntry.id).toContain("_en-US");
    expect(jpEntry.id).toContain("_ja");
    expect(usEntry.category).toContain("English (US)");
    expect(jpEntry.category).toContain("Japanese");
    expect(usEntry.summary).toContain("United States market playbook");
    expect(jpEntry.summary).toContain("Japan market playbook");
    expect(usEntry.top_hashtags[0]).not.toBe(jpEntry.top_hashtags[0]);
    expect(usEntry.cta_templates[0]).not.toBe(jpEntry.cta_templates[0]);
  });
});
