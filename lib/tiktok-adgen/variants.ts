import type { Product } from "./types";
import type { TargetMarket, AdStyle } from "./generator";

let _client: InstanceType<typeof import("openai").default> | null = null;
async function getClient(): Promise<InstanceType<typeof import("openai").default>> {
  if (!_client) {
    const { default: OpenAI } = await import("openai");
    _client = new OpenAI({
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      apiKey: process.env.DASHSCOPE_API_KEY || "",
    });
  }
  return _client;
}

const MODEL = "qwen-plus";

export type VariantDimension = "hook" | "tone" | "duration" | "cta";

const DIMENSION_INSTRUCTIONS: Record<VariantDimension, string> = {
  hook: `Generate a new HOOK for this script. Keep the body/scenes the same but replace the opening with a different hook type. Try one of these approaches:
- Pain point hook ("If you struggle with...")
- Suspense hook ("I almost returned this...")
- Number anchor hook ("$12 fix for...")
- POV hook ("POV: you just discovered...")
- Question hook ("Why does nobody talk about...")
- Social proof hook ("1M people bought this...")`,

  tone: `Keep the same content and structure, but change the TONE. Pick one of these:
- Friend sharing casually (warm, informal)
- Professional reviewer (analytical, data-driven)
- Ranting/complaining (passionate, frustrated)
- Excited discovery (high energy, surprised)
- Calm tutorial (measured, helpful)`,

  duration: `Adjust the DURATION. If the original is long, create a SHORTER version (12-15s, 3-4 scenes). If short, create a LONGER version (30-35s, 6-7 scenes) with more detail.`,

  cta: `Keep everything the same but replace the CTA with a different approach:
- Soft guide: "Link in bio if you want to try it"
- Urgency: "Grab it before it sells out"
- Social proof: "Join 1M happy customers"
- Question: "Would you try this? Comment below"
- Challenge: "Try it for 7 days and thank me later"`,
};

function buildVariantPrompt(
  product: Product,
  originalScript: {
    style?: string;
    hook?: { text: string; type: string };
    scenes: { time?: string; text: string; action?: string }[];
    cta?: { text: string; type: string };
    tone_notes?: string;
  },
  dimension: VariantDimension,
  targetMarket: TargetMarket = "us",
): string {
  const name = product.title || "this product";
  const price = product.price || "";

  const originalText = `ORIGINAL SCRIPT:
Hook: ${originalScript.hook?.text || "N/A"} (${originalScript.hook?.type || ""})
Scenes:
${originalScript.scenes.map((s) => `[${s.time || ""}] ${s.text}${s.action ? ` | Action: ${s.action}` : ""}`).join("\n")}
CTA: ${originalScript.cta?.text || "N/A"} (${originalScript.cta?.type || ""})
Tone: ${originalScript.tone_notes || "N/A"}`;

  return `You are a TikTok ad creative expert. Generate a VARIATION of the following script.

Product: ${name} ${price ? `(${price})` : ""}
${originalText}

VARY: ${DIMENSION_INSTRUCTIONS[dimension]}

Return a JSON object (no markdown, pure JSON):
{
  "hook": {"text": "new hook text", "type": "hook type"},
  "scenes": [
    {"time": "0-3s", "text": "scene description", "action": "camera direction"},
    {"time": "3-8s", "text": "scene description", "action": "camera direction"},
    {"time": "8-14s", "text": "scene description", "action": "camera direction"},
    {"time": "14-20s", "text": "scene description", "action": "camera direction"},
    {"time": "20-25s", "text": "scene description", "action": "camera direction"}
  ],
  "cta": {"text": "CTA text", "type": "CTA type"},
  "tone_notes": "describe the tone",
  "filming_tips": "practical filming advice",
  "bgm_suggestion": "background music style"
}

Keep the content relevant to the product. Be creative and specific. All content in English.`;
}

function parseResponse(text: string): Record<string, unknown> | null {
  let jsonStr = text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch {}
    }
    return null;
  }
}

function fallbackVariant(
  originalScript: { hook?: { text: string }; scenes: { time?: string; text: string; action?: string }[]; cta?: { text: string } },
  dimension: VariantDimension,
) {
  return {
    hook: {
      text: dimension === "hook" ? `Here's why you need this` : originalScript.hook?.text || "",
      type: dimension === "hook" ? "direct" : "original",
    },
    scenes: originalScript.scenes,
    cta: originalScript.cta || { text: "Link in bio!", type: "soft guide" },
    tone_notes: "Casual and authentic",
    filming_tips: "Handheld, natural lighting",
    bgm_suggestion: "Upbeat lo-fi beat",
  };
}

export async function generateVariants(
  product: Product,
  originalScript: {
    style?: string;
    hook?: { text: string; type: string };
    scenes: { time?: string; text: string; action?: string }[];
    cta?: { text: string; type: string };
    tone_notes?: string;
  },
  dimensions: VariantDimension[],
  count = 3,
  targetMarket: TargetMarket = "us",
) {
  if (!process.env.DASHSCOPE_API_KEY) {
    return dimensions.slice(0, count).map((dim) => ({
      dimension: dim,
      ...fallbackVariant(originalScript, dim),
    }));
  }

  const variants: {
    dimension: VariantDimension;
    hook: { text: string; type: string };
    scenes: { time?: string; text: string; action?: string }[];
    cta: { text: string; type?: string };
    tone_notes: string;
    filming_tips: string;
    bgm_suggestion: string;
  }[] = [];

  // Generate variants sequentially to avoid rate limits
  for (const dim of dimensions.slice(0, count)) {
    try {
      const completion = await (await getClient()).chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a TikTok ad creative expert. Always respond with valid JSON only." },
          { role: "user", content: buildVariantPrompt(product, originalScript, dim, targetMarket) },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const text = completion.choices[0]?.message?.content || "";
      const parsed = parseResponse(text);

      if (parsed?.hook && parsed?.scenes) {
        variants.push({
          dimension: dim,
          hook: parsed.hook as { text: string; type: string },
          scenes: (parsed.scenes as { time?: string; text: string; action?: string }[]),
          cta: (parsed.cta as { text: string; type: string }) || { text: "", type: "" },
          tone_notes: (parsed.tone_notes as string) || "",
          filming_tips: (parsed.filming_tips as string) || "",
          bgm_suggestion: (parsed.bgm_suggestion as string) || "",
        });
      } else {
        variants.push({ dimension: dim, ...fallbackVariant(originalScript, dim) });
      }
    } catch (e) {
      console.error(`Variant generation error (${dim}):`, e);
      variants.push({ dimension: dim, ...fallbackVariant(originalScript, dim) });
    }
  }

  return variants;
}
