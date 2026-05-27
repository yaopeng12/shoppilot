import OpenAI from "openai";
import type { Product } from "./types";

const MODEL = "qwen-plus";

export type AdStyle =
  | "pain_point"
  | "review_compare"
  | "scene_seed"
  | "plot_twist"
  | "unboxing"
  | "tutorial"
  | "rant_then_fix"
  | "social_proof";

export type TargetMarket = "us" | "jp" | "uk" | "de" | "fr";

type ParsedScript = {
  style?: string;
  hook?: { text?: string; type?: string };
  scenes?: Array<{ time?: string; text?: string; action?: string }>;
  cta?: { text?: string; type?: string };
  tone_notes?: string;
  filming_tips?: string;
  bgm_suggestion?: string;
};

type ParsedGeneration = {
  hooks?: string[];
  scripts?: ParsedScript[];
  voiceovers?: string[];
  subtitles?: Array<Array<{ time?: string; text?: string }>>;
  hashtags?: string[];
};

export type GenerateOptions = {
  style?: AdStyle;
  targetMarket?: TargetMarket;
  scriptCount?: number;
};

export const AD_STYLES: Record<AdStyle, { en: { label: string }; zh: { label: string } }> = {
  pain_point: { en: { label: "Pain point" }, zh: { label: "痛点" } },
  review_compare: { en: { label: "Review compare" }, zh: { label: "测评对比" } },
  scene_seed: { en: { label: "Scene seed" }, zh: { label: "场景种草" } },
  plot_twist: { en: { label: "Plot twist" }, zh: { label: "反转" } },
  unboxing: { en: { label: "Unboxing" }, zh: { label: "开箱" } },
  tutorial: { en: { label: "Tutorial" }, zh: { label: "教程" } },
  rant_then_fix: { en: { label: "Rant then fix" }, zh: { label: "吐槽解决" } },
  social_proof: { en: { label: "Social proof" }, zh: { label: "社交证明" } },
};

export const TARGET_MARKETS: Record<TargetMarket, { flag: string; label: string; lang: string; cultural: string }> = {
  us: { flag: "US", label: "United States", lang: "English", cultural: "direct, casual, proof-led TikTok creator style" },
  jp: { flag: "JP", label: "Japan", lang: "Japanese", cultural: "polite, detail-oriented, routine and trust focused" },
  uk: { flag: "UK", label: "United Kingdom", lang: "English", cultural: "understated, practical, dry-humor friendly" },
  de: { flag: "DE", label: "Germany", lang: "German", cultural: "specific, practical, quality and value focused" },
  fr: { flag: "FR", label: "France", lang: "French", cultural: "tasteful, concise, lifestyle-led" },
};

function getClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey,
  });
}

function buildPrompt(product: Product, options: GenerateOptions = {}) {
  const name = product.title || "this product";
  const desc = product.description?.slice(0, 300) || "";
  const price = product.price || "";
  const targetMarket = options.targetMarket || "us";
  const market = TARGET_MARKETS[targetMarket];
  const scriptCount = Math.min(Math.max(options.scriptCount || 2, 1), 5);
  const style = options.style || "pain_point";

  return `You are a TikTok ad creative director.

Product: ${name}
Description: ${desc}
Price: ${price}
Target market: ${market.label}
Language: ${market.lang}
Cultural style: ${market.cultural}
Creative style: ${style}

Return only JSON:
{
  "hooks": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"],
  "scripts": [
    {
      "style": "${style}",
      "hook": {"text": "opening line", "type": "pain point"},
      "scenes": [
        {"time": "0-3s", "text": "scene text", "action": "what to film"}
      ],
      "cta": {"text": "CTA", "type": "soft guide"},
      "tone_notes": "tone",
      "filming_tips": "tips",
      "bgm_suggestion": "music"
    }
  ],
  "voiceovers": ["voiceover paragraph"],
  "subtitles": [[{"time": "0s - 2s", "text": "subtitle"}]],
  "hashtags": ["#tag"]
}

Requirements:
- Generate exactly 5 hooks.
- Generate ${scriptCount} scripts, each with 5 scenes.
- Generate 2 voiceovers and at least 1 subtitle set.
- Write all content in ${market.lang}.
- Do not invent discounts, specs, guarantees, certifications, or medical claims.`;
}

function parseResponse(text: string): ParsedGeneration | null {
  let jsonStr = text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  try {
    return JSON.parse(jsonStr) as ParsedGeneration;
  } catch {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!objMatch) return null;
    try {
      return JSON.parse(objMatch[0]) as ParsedGeneration;
    } catch {
      return null;
    }
  }
}

function fallbackHooks(product: Product): string[] {
  const name = product.title || "this product";
  return [
    `Stop scrolling. ${name} solves a real daily problem.`,
    `I tested ${name}, and this is what surprised me.`,
    `POV: you finally found a simpler fix for this routine.`,
    `The easiest way to understand ${name} is to watch it work.`,
    `If you keep dealing with this problem, look at ${name}.`,
  ];
}

function fallbackScripts(product: Product) {
  const name = product.title || "this product";
  return [
    {
      id: 1,
      style: "pain_point",
      hook: { text: `This is the problem ${name} was made for.`, type: "pain point" },
      scenes: [
        { time: "0-3s", text: "Open on the frustrating everyday problem.", action: "Close-up of the pain point" },
        { time: "3-8s", text: `Introduce ${name} as a simple fix.`, action: "Product-in-hand reveal" },
        { time: "8-14s", text: "Show the product in use without overexplaining.", action: "Hands-on demo" },
        { time: "14-20s", text: "Show the practical result and why it matters.", action: "Before-and-after style shot" },
        { time: "20-25s", text: "Close with a clear next step.", action: "Product close-up and CTA" },
      ],
      cta: { text: "Check the link and compare it with your current routine.", type: "soft guide" },
      tone_notes: "Casual, practical, proof-led",
      filming_tips: "Use natural light, handheld shots, and one clear demo moment.",
      bgm_suggestion: "Low-volume upbeat background track",
    },
    {
      id: 2,
      style: "review_compare",
      hook: { text: `I compared a few options. ${name} was the easiest to explain.`, type: "comparison" },
      scenes: [
        { time: "0-3s", text: "Start with the comparison promise.", action: "Show product next to old solution" },
        { time: "3-8s", text: "Explain the old routine problem.", action: "Show friction or mess" },
        { time: "8-14s", text: `Demo ${name} in the same situation.`, action: "One-take demo" },
        { time: "14-20s", text: "Highlight the most visible proof point.", action: "Close-up result" },
        { time: "20-25s", text: "End with who should consider it.", action: "Creator talking to camera" },
      ],
      cta: { text: "Worth checking if this is part of your routine too.", type: "comparison CTA" },
      tone_notes: "Credible, measured, useful",
      filming_tips: "Keep the comparison honest and avoid unsupported claims.",
      bgm_suggestion: "Clean review-style background beat",
    },
  ];
}

function fallbackVoiceovers(product: Product): string[] {
  const name = product.title || "this product";
  const desc = product.description?.slice(0, 120) || "it is built around a practical everyday problem";
  return [
    `I wanted to show you ${name} because ${desc}. The useful part is that it is easy to understand on camera: show the problem, show the product in use, then show the result without making wild claims. If this is already part of your routine, it is worth comparing.`,
    `${name} is the kind of product that works best when the video stays simple. Start with the pain point, show the actual use, and focus on the moment where the viewer thinks, yes, I deal with that too. That is the angle I would test first.`,
  ];
}

function fallbackSubtitles(product: Product) {
  const name = product.title || "this product";
  return [
    [
      { time: "0s - 2s", text: "This routine needed a simpler fix" },
      { time: "2s - 5s", text: `So I tried ${name}` },
      { time: "5s - 9s", text: "The demo is the whole point" },
      { time: "9s - 13s", text: "Show the problem, then the result" },
      { time: "13s - 16s", text: "Compare it with your current setup" },
    ],
  ];
}

function fallbackHashtags(product: Product): string[] {
  const tags = ["#tiktokmademebuyit", "#productfinds", "#ecommerce", "#ugccreator"];
  if (product.tags?.length) tags.push(...product.tags.slice(0, 3).map((tag) => `#${tag.replace(/\s+/g, "")}`));
  return tags.slice(0, 8);
}

export async function generateAll(product: Product, options: GenerateOptions = {}) {
  const scriptCount = Math.min(Math.max(options.scriptCount || 2, 1), 5);
  const maxVoiceovers = 2;

  if (!process.env.DASHSCOPE_API_KEY) {
    return {
      product,
      hooks: fallbackHooks(product),
      scripts: fallbackScripts(product),
      voiceovers: fallbackVoiceovers(product),
      subtitles: fallbackSubtitles(product),
      hashtags: fallbackHashtags(product),
    };
  }

  try {
    const client = getClient();
    if (!client) throw new Error("Missing client");

    const targetMarket = options.targetMarket || "us";
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a TikTok ad creative expert for the ${TARGET_MARKETS[targetMarket].label} market. Always return valid JSON only.`,
        },
        { role: "user", content: buildPrompt(product, options) },
      ],
      temperature: 0.8,
      max_tokens: 3200,
    });

    const parsed = parseResponse(completion.choices[0]?.message?.content || "");
    if (parsed?.hooks?.length && parsed?.scripts?.length) {
      return {
        product,
        hooks: parsed.hooks.slice(0, 5),
        scripts: parsed.scripts.slice(0, scriptCount).map((script, index) => ({
          id: index + 1,
          style: script.style || options.style || "auto",
          hook: {
            text: script.hook?.text || script.scenes?.[0]?.text || "",
            type: script.hook?.type || "unknown",
          },
          scenes: (script.scenes || []).map((scene) => ({
            time: scene.time || "",
            text: scene.text || "",
            action: scene.action || "",
          })),
          cta: {
            text: script.cta?.text || "",
            type: script.cta?.type || "soft guide",
          },
          tone_notes: script.tone_notes || "",
          filming_tips: script.filming_tips || "",
          bgm_suggestion: script.bgm_suggestion || "",
        })),
        voiceovers: parsed.voiceovers?.length ? parsed.voiceovers.slice(0, maxVoiceovers) : fallbackVoiceovers(product),
        subtitles: parsed.subtitles?.length
          ? parsed.subtitles.slice(0, 2).map((set) => set.map((row) => ({ time: row.time || "", text: row.text || "" })))
          : fallbackSubtitles(product),
        hashtags: parsed.hashtags?.length ? parsed.hashtags.slice(0, 8) : fallbackHashtags(product),
      };
    }
  } catch (error) {
    console.error("DashScope API error:", error);
  }

  return {
    product,
    hooks: fallbackHooks(product),
    scripts: fallbackScripts(product),
    voiceovers: fallbackVoiceovers(product),
    subtitles: fallbackSubtitles(product),
    hashtags: fallbackHashtags(product),
  };
}
