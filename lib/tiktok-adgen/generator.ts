import OpenAI from "openai";
import type { Product } from "./types";

const MODEL = "qwen-plus";

type ParsedScript = {
  scenes?: Array<{ time?: string; text?: string }>;
};

type ParsedGeneration = {
  hooks?: string[];
  scripts?: ParsedScript[];
  voiceovers?: string[];
  subtitles?: Array<Array<{ time?: string; text?: string }>>;
};

function getClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey,
  });
}

function buildPrompt(product: Product) {
  const name = product.title || "this product";
  const desc = product.description?.slice(0, 300) || "";
  const price = product.price || "";

  return `You are a world-class TikTok ad creative director. Generate marketing content for the following product.

Product: ${name}
Description: ${desc}
Price: ${price}

Return a JSON object with exactly this structure (no markdown, no code fences, pure JSON only):
{
  "hooks": [
    "hook 1 text",
    "hook 2 text",
    "hook 3 text",
    "hook 4 text",
    "hook 5 text"
  ],
  "scripts": [
    {
      "scenes": [
        {"time": "0-3s", "text": "scene description"},
        {"time": "3-8s", "text": "scene description"},
        {"time": "8-14s", "text": "scene description"},
        {"time": "14-20s", "text": "scene description"},
        {"time": "20-25s", "text": "scene description"}
      ]
    },
    {
      "scenes": [
        {"time": "0-3s", "text": "scene description"},
        {"time": "3-8s", "text": "scene description"},
        {"time": "8-14s", "text": "scene description"},
        {"time": "14-20s", "text": "scene description"},
        {"time": "20-25s", "text": "scene description"}
      ]
    }
  ],
  "voiceovers": [
    "voiceover 1 text (full paragraph, natural speaking tone, 20-30 seconds when read aloud)",
    "voiceover 2 text (full paragraph, natural speaking tone, 20-30 seconds when read aloud)"
  ],
  "subtitles": [
    [
      {"time": "0s - 2s", "text": "subtitle text"},
      {"time": "2s - 4s", "text": "subtitle text"},
      {"time": "4s - 6s", "text": "subtitle text"},
      {"time": "6s - 8s", "text": "subtitle text"},
      {"time": "8s - 10s", "text": "subtitle text"}
    ],
    [
      {"time": "0s - 2s", "text": "subtitle text"},
      {"time": "2s - 4s", "text": "subtitle text"},
      {"time": "4s - 6s", "text": "subtitle text"},
      {"time": "6s - 8s", "text": "subtitle text"}
    ]
  ]
}

Requirements:
- hooks: 5 scroll-stopping openers, each under 20 words. Use proven TikTok formats: POV, "stop scrolling", "you need this", curiosity gaps, social proof.
- scripts: 2 complete video scripts, each 20-25 seconds, 5 scenes with timestamps. Include camera directions, text overlays, and emotional beats.
- voiceovers: 2 natural-sounding voiceover scripts, each 20-30 seconds. Conversational tone, as if talking to a friend. No bullet points — flowing speech.
- subtitles: 2 subtitle sets timed for the scripts, 4-8 lines each with timestamps.

All content must be in English. Be creative, specific to this product, and use trending TikTok ad patterns.`;
}

function parseResponse(text: string): ParsedGeneration | null {
  // Try to extract JSON from the response
  let jsonStr = text.trim();

  // Remove markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  // Try parsing
  try {
    return JSON.parse(jsonStr) as ParsedGeneration;
  } catch {
    // Try to find JSON object in the text
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]) as ParsedGeneration;
      } catch {}
    }
    return null;
  }
}

function fallbackHooks(product: Product): string[] {
  const name = product.title || "this product";
  return [
    `Stop scrolling! You need ${name} in your life 👀`,
    `POV: You just discovered ${name} and everything changed`,
    `I tested ${name} for 30 days — here's the truth`,
    `The internet is OBSESSED with ${name} and now I know why`,
    `Why didn't anyone tell me about ${name} sooner?! 😱`,
  ];
}

function fallbackScripts(product: Product) {
  const name = product.title || "this product";
  return [
    {
      scenes: [
        { time: "0-3s", text: `Hook: "You NEED to see this" — text overlay, close-up of ${name}` },
        { time: "3-8s", text: "Show the problem / pain point that this product solves" },
        { time: "8-14s", text: `Introduce ${name}, first impressions, genuine reaction` },
        { time: "14-20s", text: "Demo the product in action, show key features" },
        { time: "20-25s", text: `Results + CTA: "${product.price || "Affordable"} — link in bio!"` },
      ],
    },
    {
      scenes: [
        { time: "0-3s", text: `"Things TikTok made me buy" trend opening` },
        { time: "3-8s", text: `Unboxing ${name}, show packaging and first impressions` },
        { time: "8-14s", text: "Try it for the first time on camera" },
        { time: "14-20s", text: "Show before vs after or key benefits" },
        { time: "20-25s", text: `Rating: ⭐⭐⭐⭐⭐ — "Worth every penny. Link below!"` },
      ],
    },
  ];
}

function fallbackVoiceovers(product: Product): string[] {
  const name = product.title || "this product";
  const desc = product.description?.slice(0, 100) || "something amazing";
  return [
    `Okay so I need to tell you about ${name}. ${desc}. I was honestly skeptical at first, but after trying it? Game changer. The quality is insane and it's only ${product.price || "a great price"}. I've already ordered two more for my friends. Link in bio — go grab one before they sell out!`,
    `Real talk — ${name} is the best thing I've bought this month. ${desc}. No complicated setup, it just works. And for ${product.price || "this price"}? That's honestly a steal. My followers keep asking me about it. Trust me on this one — you won't regret it. Link is right there!`,
  ];
}

function fallbackSubtitles(product: Product) {
  const name = product.title || "this product";
  const lines = [
    `Stop scrolling! You need ${name}`,
    "I was skeptical at first...",
    "But after trying it? Game changer.",
    `Only ${product.price || "affordable"}!`,
    "Link in bio — grab yours!",
  ];
  return [
    lines.map((text, i) => ({
      time: `${i * 2}s - ${(i + 1) * 2}s`,
      text,
    })),
  ];
}

export async function generateAll(product: Product) {
  if (!process.env.DASHSCOPE_API_KEY) {
    // No API key — return fallback templates
    return {
      product,
      hooks: fallbackHooks(product),
      scripts: fallbackScripts(product),
      voiceovers: fallbackVoiceovers(product),
      subtitles: fallbackSubtitles(product),
    };
  }

  try {
    const client = getClient();
    if (!client) {
      return {
        product,
        hooks: fallbackHooks(product),
        scripts: fallbackScripts(product),
        voiceovers: fallbackVoiceovers(product),
        subtitles: fallbackSubtitles(product),
      };
    }

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a TikTok ad creative expert. Always respond with valid JSON only, no markdown formatting." },
        { role: "user", content: buildPrompt(product) },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = parseResponse(text);

    if (parsed?.hooks?.length && parsed?.scripts?.length) {
      return {
        product,
        hooks: parsed.hooks.slice(0, 5),
        scripts: parsed.scripts.slice(0, 2).map((s, i) => ({
          id: i + 1,
          scenes: s.scenes || [],
        })),
        voiceovers: parsed.voiceovers?.length ? parsed.voiceovers.slice(0, 2) : fallbackVoiceovers(product),
        subtitles: parsed.subtitles?.length ? parsed.subtitles.slice(0, 2) : fallbackSubtitles(product),
      };
    }
  } catch (e) {
    console.error("DashScope API error:", e);
  }

  // Fallback if API fails
  return {
    product,
    hooks: fallbackHooks(product),
    scripts: fallbackScripts(product),
    voiceovers: fallbackVoiceovers(product),
    subtitles: fallbackSubtitles(product),
  };
}
