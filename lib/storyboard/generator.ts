import OpenAI from "openai";
import type { Product } from "@/lib/tiktok-adgen/types";
import type {
  CameraMovement,
  StoryboardData,
  StoryboardFrame,
  StoryboardOptions,
  Transition,
  VerticalDomainId,
} from "./types";
import { VERTICAL_DOMAINS } from "./types";

const MODEL = "qwen-plus";

function getClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey,
  });
}

type ParsedStoryboardFrame = Partial<StoryboardFrame>;

type ParsedStoryboardResponse = {
  totalDuration?: number;
  frames?: ParsedStoryboardFrame[];
  metadata?: Partial<StoryboardData["metadata"]>;
};

function resolveVertical(value?: string): VerticalDomainId {
  return value && value in VERTICAL_DOMAINS ? (value as VerticalDomainId) : "general";
}

function buildPrompt(product: Product, options: StoryboardOptions = {}) {
  const name = product.title || "this product";
  const desc = product.description?.slice(0, 300) || "";
  const price = product.price || "";
  const vertical = resolveVertical(options.vertical);
  const strategy = VERTICAL_DOMAINS[vertical];
  const creativeAngle = options.creativeAngle?.trim() || strategy.proofPattern;

  return `You are a world-class TikTok ad director. Create a detailed storyboard for a TikTok video ad.

Product: ${name}
Description: ${desc}
Price: ${price}

Vertical domain: ${strategy.label}
Primary audience: ${strategy.audience}
Audience pain points: ${strategy.painPoints.join(", ")}
Visual language: ${strategy.visualLanguage}
Proof pattern: ${strategy.proofPattern}
Requested creative angle: ${creativeAngle}
Compliance guardrails: ${strategy.complianceNotes}
CTA style: ${strategy.ctaStyle}

Return a JSON object with exactly this structure (no markdown, no code fences, pure JSON only):
{
  "totalDuration": 20,
  "frames": [
    {
      "scene": 1,
      "startTime": 0,
      "endTime": 3,
      "duration": 3,
      "visual": "Detailed visual description of what appears on screen",
      "camera": "zoom-in",
      "textOverlay": "Text that appears on screen",
      "narration": "What the speaker says",
      "transition": "cut"
    }
  ],
  "metadata": {
    "style": "ad style (e.g., unboxing, demo, testimonial, problem-solution)",
    "targetAudience": "target audience description",
    "platform": "TikTok",
    "vertical": "${vertical}",
    "creativeAngle": "${creativeAngle}",
    "productionNotes": ["short production note 1", "short production note 2"]
  }
}

Requirements:
- Total duration: 15-30 seconds (TikTok optimal length)
- 5-8 scenes/frames
- Each frame must have: scene number, startTime, endTime, duration, visual description, camera movement, text overlay, narration, transition
- Camera movements: "static", "zoom-in", "zoom-out", "pan-left", "pan-right", "tilt-up", "tilt-down", "tracking"
- Transitions: "cut", "fade", "dissolve", "wipe", "zoom"
- Visual descriptions should be detailed enough for an AI video generator
- Include specific camera angles and movements
- Text overlays should be short and punchy (under 10 words)
- Narration should be natural, conversational TikTok style
- Use proven TikTok ad patterns: hook in first 2 seconds, problem-solution, social proof, CTA at end
- Make every scene specific to the vertical domain, not generic ecommerce
- Use the visual language and proof pattern above when describing shots
- Respect compliance guardrails; do not invent unsupported claims, specs, certifications, discounts, or guarantees
- Add 2-4 practical production notes in metadata.productionNotes

All content must be in English. Be creative and specific to this product.`;
}

function parseResponse(text: string): ParsedStoryboardResponse | null {
  let jsonStr = text.trim();

  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  try {
    return JSON.parse(jsonStr) as ParsedStoryboardResponse;
  } catch {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]) as ParsedStoryboardResponse;
      } catch {}
    }
    return null;
  }
}

function fallbackStoryboard(product: Product, options: StoryboardOptions = {}): StoryboardData {
  const name = product.title || "this product";
  const price = product.price || "a great price";
  const vertical = resolveVertical(options.vertical);
  const strategy = VERTICAL_DOMAINS[vertical];
  const creativeAngle = options.creativeAngle?.trim() || strategy.proofPattern;

  const frames: StoryboardFrame[] = [
    {
      scene: 1,
      startTime: 0,
      endTime: 3,
      duration: 3,
      visual: `Vertical-specific hook shot for ${strategy.label}: ${name} appears in a realistic use setting with ${strategy.visualLanguage}.`,
      camera: "zoom-in",
      textOverlay: "You need this",
      narration: `Stop scrolling if this problem feels familiar. ${name} might be the easiest upgrade.`,
      transition: "cut",
    },
    {
      scene: 2,
      startTime: 3,
      endTime: 7,
      duration: 4,
      visual: `Creator shows the core pain point: ${strategy.painPoints[0]}, using a natural day-in-the-life setup.`,
      camera: "static",
      textOverlay: "Sound familiar?",
      narration: "This is the part of the routine that gets annoying fast.",
      transition: "cut",
    },
    {
      scene: 3,
      startTime: 7,
      endTime: 12,
      duration: 5,
      visual: `Hands-on reveal of ${name}, then an immediate demo framed around: ${creativeAngle}.`,
      camera: "tracking",
      textOverlay: "Easy fix",
      narration: `Then I tried ${name}, and the difference was obvious in the first few seconds.`,
      transition: "fade",
    },
    {
      scene: 4,
      startTime: 12,
      endTime: 17,
      duration: 5,
      visual: `Close-up proof sequence showing ${name} in use, following this pattern: ${strategy.proofPattern}.`,
      camera: "pan-right",
      textOverlay: "Look at this",
      narration: "The value is easier to understand once you see it working in a real routine.",
      transition: "cut",
    },
    {
      scene: 5,
      startTime: 17,
      endTime: 22,
      duration: 5,
      visual: `Final result moment with ${name} clearly visible, then a clean CTA frame with the price shown if available.`,
      camera: "zoom-out",
      textOverlay: `${price} - Link in bio`,
      narration: `And the best part? It is ${price}. Check it out while it is still available.`,
      transition: "fade",
    },
  ];

  return {
    product,
    totalDuration: 22,
    frames,
    metadata: {
      style: "vertical problem-solution demo",
      targetAudience: strategy.audience,
      platform: "TikTok",
      vertical,
      creativeAngle,
      productionNotes: [
        `Use ${strategy.visualLanguage}.`,
        strategy.complianceNotes,
        `CTA should feel like: ${strategy.ctaStyle}.`,
      ],
    },
  };
}

export async function generateStoryboard(product: Product, options: StoryboardOptions = {}): Promise<StoryboardData> {
  if (!process.env.DASHSCOPE_API_KEY) {
    return fallbackStoryboard(product, options);
  }

  try {
    const client = getClient();
    if (!client) return fallbackStoryboard(product, options);

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a TikTok ad director expert. Always respond with valid JSON only, no markdown formatting." },
        { role: "user", content: buildPrompt(product, options) },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = parseResponse(text);

    if (parsed?.frames?.length) {
      const vertical = resolveVertical(parsed.metadata?.vertical || options.vertical);
      const strategy = VERTICAL_DOMAINS[vertical];

      return {
        product,
        totalDuration: parsed.totalDuration || parsed.frames.reduce((sum, f) => sum + (f.duration || 0), 0),
        frames: parsed.frames.map((f, i) => ({
          scene: f.scene || i + 1,
          startTime: f.startTime || 0,
          endTime: f.endTime || 0,
          duration: f.duration || 0,
          visual: f.visual || "",
          camera: validateCamera(f.camera || ""),
          textOverlay: f.textOverlay || "",
          narration: f.narration || "",
          transition: validateTransition(f.transition || ""),
        })),
        metadata: {
          style: parsed.metadata?.style || "TikTok ad",
          targetAudience: parsed.metadata?.targetAudience || strategy.audience,
          platform: "TikTok",
          vertical,
          creativeAngle: parsed.metadata?.creativeAngle || options.creativeAngle?.trim() || strategy.proofPattern,
          productionNotes: Array.isArray(parsed.metadata?.productionNotes)
            ? parsed.metadata.productionNotes.slice(0, 4)
            : [strategy.visualLanguage, strategy.complianceNotes],
        },
      };
    }
  } catch (e) {
    console.error("DashScope API error:", e);
  }

  return fallbackStoryboard(product, options);
}

function validateCamera(value: string): CameraMovement {
  const valid: CameraMovement[] = ["static", "zoom-in", "zoom-out", "pan-left", "pan-right", "tilt-up", "tilt-down", "tracking"];
  return valid.includes(value as CameraMovement) ? (value as CameraMovement) : "static";
}

function validateTransition(value: string): Transition {
  const valid: Transition[] = ["cut", "fade", "dissolve", "wipe", "zoom"];
  return valid.includes(value as Transition) ? (value as Transition) : "cut";
}
