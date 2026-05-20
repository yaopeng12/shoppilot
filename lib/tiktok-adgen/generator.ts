import type { Product } from "./types";
import type { VideoAnalysis, KnowledgeEntry } from "@/lib/inspiration/types";

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

// --- 8 Script Styles (aligned with PRD kfwd.md) ---

export const AD_STYLES = {
  pain_point: {
    en: { label: "Pain Point", desc: "Start from user pain, build resonance" },
    zh: { label: "痛点共鸣", desc: "从用户痛点切入，引发共鸣" },
  },
  review_compare: {
    en: { label: "Review / Compare", desc: "Tried X, only this one works" },
    zh: { label: "测评对比", desc: "试了X个，只有这个好用" },
  },
  scene_seed: {
    en: { label: "Scene Seeding", desc: "Natural product showcase in daily life" },
    zh: { label: "场景种草", desc: "生活场景中自然展示产品" },
  },
  plot_twist: {
    en: { label: "Plot Twist", desc: "Almost returned it, then..." },
    zh: { label: "反转型", desc: "差点退货，结果真香了" },
  },
  unboxing: {
    en: { label: "Unboxing", desc: "Unboxing + genuine surprise reaction" },
    zh: { label: "开箱惊喜", desc: "开箱过程 + 惊喜反应" },
  },
  tutorial: {
    en: { label: "Tutorial", desc: "3 steps to solve your problem" },
    zh: { label: "教程教学", desc: "教你3步搞定XXX" },
  },
  rant_then_fix: {
    en: { label: "Rant & Fix", desc: "Complain about the problem, then reveal the solution" },
    zh: { label: "痛点吐槽", desc: "先吐槽问题再给方案" },
  },
  social_proof: {
    en: { label: "Social Proof", desc: "1M people bought this / friend recommended" },
    zh: { label: "社交证明", desc: "100万人买的 / 朋友强烈推荐" },
  },
} as const;

export type AdStyle = keyof typeof AD_STYLES;

// --- Target Markets (10 markets with cultural localization) ---

export const TARGET_MARKETS = {
  us: { lang: "en-US", label: "United States", flag: "🇺🇸", cultural: "casual American English, Gen-Z slang, emoji-friendly, direct and energetic" },
  uk: { lang: "en-GB", label: "United Kingdom", flag: "🇬🇧", cultural: "British expressions, dry humor, understated wit, slightly more formal than US" },
  th: { lang: "th", label: "Thailand", flag: "🇹🇭", cultural: "Thai casual speech, use ค่ะ/ครับ appropriately, trending Thai TikTok phrases, warm and friendly" },
  id: { lang: "id", label: "Indonesia", flag: "🇮🇩", cultural: "Bahasa gaul (informal Indonesian), Indonesian TikTok slang, enthusiastic and relatable" },
  ph: { lang: "en-PH", label: "Philippines", flag: "🇵🇭", cultural: "Taglish (Tagalog-English mix), Filipino humor, 'diba', 'grabe', expressive" },
  vn: { lang: "vi", label: "Vietnam", flag: "🇻🇳", cultural: "Vietnamese casual, trending Vietnamese TikTok phrases, youthful and trendy" },
  my: { lang: "ms", label: "Malaysia", flag: "🇲🇾", cultural: "Manglish (Malay-English mix), Malaysian humor, 'lah', 'walao', casual" },
  jp: { lang: "ja", label: "Japan", flag: "🇯🇵", cultural: "Japanese casual (タメ口), Japanese TikTok trends, polite but relatable, use trending expressions" },
  mx: { lang: "es", label: "Mexico / LatAm", flag: "🇲🇽", cultural: "Latin American Spanish, Mexican slang (güey, neta, chido), expressive and warm" },
  br: { lang: "pt-BR", label: "Brazil", flag: "🇧🇷", cultural: "Brazilian Portuguese, gírias brasileiras (mano, tipo, né), energetic and fun" },
} as const;

export type TargetMarket = keyof typeof TARGET_MARKETS;

// --- Prompt Builder ---

function buildPrompt(
  product: Product,
  trendingContext?: VideoAnalysis[],
  knowledge?: KnowledgeEntry,
  style?: AdStyle,
  targetMarket: TargetMarket = "us",
  scriptCount = 10,
) {
  const name = product.title || "this product";
  const desc = product.description?.slice(0, 300) || "";
  const price = product.price || "";

  const styleInstruction = style
    ? `\nCREATIVE STYLE: ${style.toUpperCase()}\n${getStyleInstruction(style)}`
    : `\nCREATIVE STYLE: AUTO\nChoose the most appropriate style for this product from: pain_point, review_compare, scene_seed, plot_twist, unboxing, tutorial, rant_then_fix, social_proof. Vary styles across scripts for diversity.`;

  const knowledgeSection = knowledge
    ? `\nCATEGORY KNOWLEDGE BASE (${knowledge.category}):\n${formatKnowledge(knowledge)}`
    : "";

  const trendingSection = trendingContext?.length
    ? `\nTRENDING VIDEO INSPIRATION (for reference only, do not copy):\nThe following patterns are from top-performing TikTok ads this week:\n${trendingContext
        .map(
          (t, i) =>
            `${i + 1}. Top Hook: "${t.hooks[0]}" — ${t.engagement_score}% engagement\n   CTA: "${t.cta_patterns[0]}"`,
        )
        .join("\n")}\n\nUse these patterns as creative inspiration. Adapt their successful elements to this specific product, but create original content.`
    : "";

  const market = TARGET_MARKETS[targetMarket];
  const marketSection = `\nTARGET MARKET: ${market.label} (${market.lang})
CULTURAL STYLE: ${market.cultural}
LANGUAGE: Write ALL content (hooks, scripts, voiceovers, subtitles, hashtags) in ${market.lang}
IMPORTANT: Use native ${market.lang} expressions and local TikTok slang. Do NOT translate literally — sound like a local creator sharing a find with friends.`;

  const count = Math.min(Math.max(scriptCount, 1), 20);

  return `You are a world-class TikTok ad creative director. Generate marketing content for the following product.

Product: ${name}
Description: ${desc}
Price: ${price}
${marketSection}${styleInstruction}${knowledgeSection}${trendingSection}

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
      "style": "the style used for this script",
      "hook": {"text": "opening line", "type": "hook classification (e.g. pain point, suspense, number anchor, POV, question)"},
      "scenes": [
        {"time": "0-3s", "text": "scene description", "action": "what to film / camera direction"},
        {"time": "3-8s", "text": "scene description", "action": "what to film"},
        {"time": "8-14s", "text": "scene description", "action": "what to film"},
        {"time": "14-20s", "text": "scene description", "action": "what to film"},
        {"time": "20-25s", "text": "scene description", "action": "what to film"}
      ],
      "cta": {"text": "call to action text", "type": "CTA type (e.g. soft guide, urgency, social proof)"},
      "tone_notes": "describe the tone and emotional arc",
      "filming_tips": "practical filming advice (lighting, angle, setup)",
      "bgm_suggestion": "background music style suggestion"
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
  ],
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}

Requirements:
- hooks: 5 scroll-stopping openers, each under 20 words. Match the selected creative style. Use proven TikTok formats.
- scripts: ${count} complete video scripts, each 20-25 seconds, 5 scenes with timestamps. Each script must include: style, hook (text + type), scenes (time + text + action), cta (text + type), tone_notes, filming_tips, bgm_suggestion.
- voiceovers: ${Math.min(count, 5)} natural-sounding voiceover scripts, each 20-30 seconds. Conversational tone, as if talking to a friend.
- subtitles: ${Math.min(count, 5)} subtitle sets timed for the scripts, 4-8 lines each with timestamps.
- hashtags: 5-8 relevant hashtags combining product niche, trending tags, and broad discovery tags.

All content must be in ${market.lang}. Be creative, specific to this product. Sound like a real ${market.label} TikTok creator.`;
}

function getStyleInstruction(style: AdStyle): string {
  const instructions: Record<AdStyle, string> = {
    pain_point:
      "Start from a relatable user pain point. Build emotional resonance before introducing the product as the solution. Use phrases like 'If you struggle with...', 'The worst part about...'. Tone: empathetic, understanding, then empowering.",
    review_compare:
      "Write as an honest product comparison. Tried multiple solutions, this one wins. Use phrases like 'I tested 5 different...', 'Only one actually worked'. Tone: analytical, credible, data-driven.",
    scene_seed:
      "Show the product naturally in a real-life scenario. Don't sell — just show how it fits into daily life. Use phrases like 'My morning routine now...', 'Just a regular day but...'. Tone: casual, aspirational, lifestyle.",
    plot_twist:
      "Start with doubt or a negative impression, then reveal a surprising positive twist. Use phrases like 'I almost returned this...', 'Worst purchase? No — best purchase'. Tone: dramatic arc from skepticism to delight.",
    unboxing:
      "Capture the excitement of opening a package. Show genuine first impressions, packaging, and initial reactions. Use phrases like 'Look what just arrived...', 'The packaging alone...'. Tone: excited, curious, genuine surprise.",
    tutorial:
      "Teach the audience how to use the product in 3-5 simple steps. Educational but engaging. Use phrases like 'Here's how to...', 'Step 1: ...', 'In 30 seconds you can...'. Tone: helpful, clear, knowledgeable.",
    rant_then_fix:
      "Start by ranting about a common frustration, then present the product as the fix. Use phrases like 'Why does nobody talk about...', 'I'm so tired of... BUT'. Tone: passionate complaint → satisfying solution.",
    social_proof:
      "Lead with social validation — millions of buyers, viral status, friend recommendations. Use phrases like '1 million people can't be wrong...', 'My friend wouldn't stop talking about...'. Tone: enthusiastic, trust-building, FOMO-inducing.",
  };
  return instructions[style];
}

function formatKnowledge(knowledge: KnowledgeEntry): string {
  const parts: string[] = [];

  if (knowledge.hook_patterns?.length) {
    parts.push(
      `PROVEN HOOK PATTERNS in this category:\n${knowledge.hook_patterns
        .map((h) => `- ${h.pattern}: "${h.example}"`)
        .join("\n")}`,
    );
  }

  if (knowledge.structure_templates?.length) {
    parts.push(
      `BEST VIDEO STRUCTURES:\n${knowledge.structure_templates
        .map((s) => `- ${s.name}: ${s.scenes.map((sc) => sc.description).join(" → ")}`)
        .join("\n")}`,
    );
  }

  if (knowledge.cta_templates?.length) {
    parts.push(`TOP CTAs: ${knowledge.cta_templates.join(", ")}`);
  }

  if (knowledge.tone_profiles?.length) {
    parts.push(`DOMINANT TONES: ${knowledge.tone_profiles.join(", ")}`);
  }

  if (knowledge.top_hashtags?.length) {
    parts.push(`TRENDING HASHTAGS: ${knowledge.top_hashtags.map((t) => `#${t}`).join(" ")}`);
  }

  if (knowledge.summary) {
    parts.push(`STRATEGIC SUMMARY: ${knowledge.summary}`);
  }

  return parts.join("\n\n");
}

function parseResponse(text: string) {
  let jsonStr = text.trim();

  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {}
    }
    return null;
  }
}

// --- Fallbacks ---

function fallbackHooks(product: Product): string[] {
  const name = product.title || "this product";
  return [
    `Stop scrolling! You need ${name} in your life`,
    `POV: You just discovered ${name} and everything changed`,
    `I tested ${name} for 30 days — here's the truth`,
    `The internet is OBSESSED with ${name} and now I know why`,
    `Why didn't anyone tell me about ${name} sooner?!`,
  ];
}

function fallbackScripts(product: Product) {
  const name = product.title || "this product";
  return [
    {
      id: 1,
      style: "pain_point",
      hook: { text: `You NEED to see this`, type: "pain point" },
      scenes: [
        { time: "0-3s", text: `Hook: "You NEED to see this" — text overlay, close-up of ${name}`, action: "Close-up shot with text overlay" },
        { time: "3-8s", text: "Show the problem / pain point that this product solves", action: "Show the frustration" },
        { time: "8-14s", text: `Introduce ${name}, first impressions, genuine reaction`, action: "Hold up the product" },
        { time: "14-20s", text: "Demo the product in action, show key features", action: "Hands-on demo" },
        { time: "20-25s", text: `Results + CTA: "${product.price || "Affordable"} — link in bio!"`, action: "Show results, point down" },
      ],
      cta: { text: "Link in bio!", type: "soft guide" },
      tone_notes: "Casual, authentic, building from frustration to satisfaction",
      filming_tips: "Handheld, natural lighting, keep it raw and real",
      bgm_suggestion: "Upbeat lo-fi beat, volume below voiceover",
    },
    {
      id: 2,
      style: "plot_twist",
      hook: { text: `I almost returned ${name}...`, type: "suspense" },
      scenes: [
        { time: "0-3s", text: `"Things TikTok made me buy" trend opening`, action: "Trend-style opening" },
        { time: "3-8s", text: `Unboxing ${name}, show packaging and first impressions`, action: "Unboxing shot" },
        { time: "8-14s", text: "Try it for the first time on camera", action: "First use reaction" },
        { time: "14-20s", text: "Show before vs after or key benefits", action: "Split screen or comparison" },
        { time: "20-25s", text: `Rating: 5 stars — "Worth every penny. Link below!"`, action: "Thumbs up, point to link" },
      ],
      cta: { text: "Worth every penny. Link below!", type: "social proof" },
      tone_notes: "From doubt to surprise, emotional arc",
      filming_tips: "Start casual, get more polished as the reveal happens",
      bgm_suggestion: "Dramatic shift — suspenseful then uplifting",
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

function fallbackHashtags(product: Product): string[] {
  const tags = ["#tiktokmademebuyit", "#trending", "#viral"];
  const name = (product.title || "").toLowerCase();
  if (name) tags.push(`#${name.replace(/\s+/g, "").slice(0, 20)}`);
  if (product.tags?.length) {
    tags.push(...product.tags.slice(0, 3).map((t) => `#${t.replace(/\s+/g, "")}`));
  }
  return tags.slice(0, 8);
}

// --- Public API ---

export type GenerateOptions = {
  trendingContext?: VideoAnalysis[];
  knowledge?: KnowledgeEntry;
  style?: AdStyle;
  targetMarket?: TargetMarket;
  scriptCount?: number;
};

export async function generateAll(product: Product, options: GenerateOptions = {}) {
  const targetMarket = options.targetMarket || "us";
  const scriptCount = options.scriptCount || 10;
  const maxScripts = Math.min(scriptCount, 20);
  const maxVoiceovers = Math.min(maxScripts, 5);
  const maxSubtitles = Math.min(maxScripts, 5);

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
    const completion = await (await getClient()).chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: `You are a TikTok ad creative expert for the ${TARGET_MARKETS[targetMarket].label} market. Always respond with valid JSON only, no markdown formatting.` },
        { role: "user", content: buildPrompt(product, options.trendingContext, options.knowledge, options.style, targetMarket, scriptCount) },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = parseResponse(text);

    if (parsed?.hooks?.length && parsed?.scripts?.length) {
      return {
        product,
        hooks: parsed.hooks.slice(0, 5),
        scripts: parsed.scripts.slice(0, maxScripts).map((s: any, i: number) => ({
          id: i + 1,
          style: s.style || options.style || "auto",
          hook: s.hook || { text: s.scenes?.[0]?.text || "", type: "unknown" },
          scenes: (s.scenes || []).map((sc: any) => ({
            time: sc.time,
            text: sc.text,
            action: sc.action || "",
          })),
          cta: s.cta || { text: "", type: "soft guide" },
          tone_notes: s.tone_notes || "",
          filming_tips: s.filming_tips || "",
          bgm_suggestion: s.bgm_suggestion || "",
        })),
        voiceovers: parsed.voiceovers?.length ? parsed.voiceovers.slice(0, maxVoiceovers) : fallbackVoiceovers(product),
        subtitles: parsed.subtitles?.length ? parsed.subtitles.slice(0, maxSubtitles) : fallbackSubtitles(product),
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, 8) : fallbackHashtags(product),
      };
    }
  } catch (e) {
    console.error("DashScope API error:", e);
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
