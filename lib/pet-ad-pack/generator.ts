import OpenAI from "openai";
import type { Product } from "@/lib/tiktok-adgen/types";
import type { AdPackScene, PetAdPack, PetAdPackOptions, PetTemplate } from "./types";
import {
  getLocalizedAdPackFallback,
  buildLocalizationPrompt,
  getLocalizedTemplateSignal,
  getMarketProfile,
  normalizeTargetMarket,
} from "@/lib/localization/markets";
import { PET_CLEANING_TEMPLATES } from "./templates";
import { getScenarioLabel, matchBestSource } from "./source-match";

const MODEL = "qwen-plus";

type ParsedAdPack = Partial<Omit<PetAdPack, "product" | "selectedSource" | "alternatives" | "selectedTemplate" | "detectedScenario">>;

function getClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey,
  });
}

function selectTemplate(scenario: PetAdPack["detectedScenario"], sourceType: string): PetTemplate {
  const exact = PET_CLEANING_TEMPLATES.find(
    (template) => template.scenario === scenario && template.bestFor.some((item) => sourceType.toLowerCase().includes(item.toLowerCase())),
  );
  return exact || PET_CLEANING_TEMPLATES.find((template) => template.scenario === scenario) || PET_CLEANING_TEMPLATES[0];
}

function productName(product: Product) {
  return product.title?.trim() || "pet cleaning product";
}

function buildPrompt(product: Product, basePack: PetAdPack, options: PetAdPackOptions) {
  const source = basePack.selectedSource;
  const template = basePack.selectedTemplate;
  const note = options.userNote?.trim() || "No extra user note.";
  const market = basePack.localization;

  return `You are an ecommerce growth strategist focused only on pet home cleaning, cat odor control, cat litter, pet urine cleanup, and pet hair cleanup.

Create a complete Pet Cleaning Ad Pack for this product. The tool has already selected the best 1688-style source candidate and the best creative template. Use them.

${buildLocalizationPrompt(market.code)}

Product:
- Name: ${productName(product)}
- Description: ${product.description || "Unknown"}
- Price: ${product.price || "Unknown"}
- Tags: ${(product.tags || []).join(", ") || "None"}
- User note: ${note}

Detected scenario: ${getScenarioLabel(basePack.detectedScenario)}
Selected source:
- Title: ${source.title}
- Type: ${source.productType}
- Score: ${source.score}/100
- Reasons: ${source.reasons.join("; ")}
- Estimated cost: RMB ${source.estimatedPriceCny}
- Suggested retail: USD ${source.suggestedRetailUsd}

Selected template:
- Name: ${template.name}
- Format: ${template.format}
- Opening: ${template.opening}
- Structure: ${template.structure.join(" | ")}
- Risk notes: ${template.riskNotes.join(" | ")}

Return only JSON with this exact shape:
{
  "targetMarket": "${market.code}",
  "strategy": {
    "positioning": "one sentence",
    "targetAudience": "one sentence",
    "corePainPoint": "one sentence",
    "productPromise": "one sentence",
    "proofAngle": "one sentence",
    "offerAngle": "one sentence"
  },
  "hooks": ["5 hooks, each under 16 words"],
  "scripts": [
    {
      "id": "15s",
      "name": "15-second UGC",
      "duration": "15s",
      "hook": "opening line",
      "scenes": [
        {"time":"0-2s","objective":"hook","visual":"what to film","overlay":"short overlay","narration":"spoken line"}
      ],
      "cta": "short CTA",
      "tone": "creator tone"
    }
  ],
  "storyboard": [
    {"time":"0-2s","objective":"hook","visual":"what to film","overlay":"short overlay","narration":"spoken line"}
  ],
  "shotList": ["8 practical shots"],
  "captions": ["5 caption or subtitle lines"],
  "voiceover": "natural 20-25 second voiceover",
  "aiVideoPrompts": ["4 prompts for AI video generation"],
  "compliance": {
    "safeClaims": ["safe claim"],
    "avoidClaims": ["claim to avoid"],
    "saferPhrases": ["replacement phrase"]
  },
  "testingPlan": [
    {"variant":"A","change":"what changes","successMetric":"metric"}
  ]
}

Rules:
- Output all user-facing creative content in ${market.language}. Do not translate from Chinese or English literally.
- Hooks, narration, CTA, captions, subtitles, and voiceover must sound like a native young TikTok creator in ${market.targetMarket}.
- Internal production notes may be concise, but they should still respect the local market context.
- Make it specific to pet cleaning and home odor control, never generic ecommerce.
- Do not invent certifications, veterinary proof, pet safety proof, sterilization rates, guaranteed stain removal, or guaranteed odor removal.
- Prefer believable creator language over polished brand slogans.
- Include one 15s script and one 25s script.
- Storyboard should have 5-7 scenes.`;
}

function parseResponse(text: string): ParsedAdPack | null {
  let jsonStr = text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  try {
    return JSON.parse(jsonStr) as ParsedAdPack;
  } catch {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!objMatch) return null;
    try {
      return JSON.parse(objMatch[0]) as ParsedAdPack;
    } catch {
      return null;
    }
  }
}

function fallbackScenes(product: Product, template: PetTemplate, options: PetAdPackOptions = {}): AdPackScene[] {
  const name = productName(product);
  const signal = getLocalizedTemplateSignal(
    {
      productName: name,
      painPoint: template.scenario,
      productCategory: template.bestFor[0] || "pet cleaning",
      useScene: "pet cleaning area",
    },
    options.targetMarket,
  );
  const copy = getLocalizedAdPackFallback(
    {
      productName: name,
      painPoint: template.scenario,
      productCategory: template.bestFor[0] || "pet cleaning",
      useScene: "pet_cleaning_area",
    },
    options.targetMarket,
  );

  return [
    {
      time: "0-2s",
      objective: copy.sceneObjectives[0],
      visual: copy.sceneVisuals[0],
      overlay: signal.captions[0],
      narration: signal.opener,
    },
    {
      time: "2-5s",
      objective: copy.sceneObjectives[1],
      visual: copy.sceneVisuals[1],
      overlay: signal.captions[1],
      narration: signal.secondaryHook,
    },
    {
      time: "5-9s",
      objective: copy.sceneObjectives[2],
      visual: copy.sceneVisuals[2],
      overlay: signal.captions[2],
      narration: signal.productReveal,
    },
    {
      time: "9-14s",
      objective: copy.sceneObjectives[3],
      visual: copy.sceneVisuals[3],
      overlay: signal.proofLine,
      narration: signal.proofLine,
    },
    {
      time: "14-20s",
      objective: copy.sceneObjectives[4],
      visual: copy.sceneVisuals[4],
      overlay: signal.cta,
      narration: signal.cta,
    },
  ];
}

function fallbackPack(product: Product, options: PetAdPackOptions = {}): PetAdPack {
  const targetMarket = normalizeTargetMarket(options.targetMarket);
  const localization = getMarketProfile(targetMarket);
  const matched = matchBestSource(product, options.userNote);
  const selectedTemplate = selectTemplate(matched.detectedScenario, matched.selected.productType);
  const name = productName(product);
  const signal = getLocalizedTemplateSignal(
    {
      productName: name,
      painPoint: matched.detectedScenario,
      productCategory: matched.selected.productType,
      useScene: "pet cleaning area",
    },
    targetMarket,
  );
  const copy = getLocalizedAdPackFallback(
    {
      productName: name,
      painPoint: matched.detectedScenario,
      productCategory: matched.selected.productType,
      useScene: "pet_cleaning_area",
    },
    targetMarket,
  );
  const scenes = fallbackScenes(product, selectedTemplate, { ...options, targetMarket });
  const localizedSource = {
    ...matched.selected,
    title: copy.source.title,
    productType: copy.source.productType,
    reasons: copy.source.reasons,
  };
  const localizedTemplate = {
    ...selectedTemplate,
    name: copy.template.name,
    format: copy.template.format,
    opening: signal.opener,
    structure: copy.template.structure,
    riskNotes: copy.template.riskNotes,
  };

  return {
    product,
    targetMarket,
    localization,
    detectedScenario: matched.detectedScenario,
    selectedSource: localizedSource,
    alternatives: matched.alternatives,
    selectedTemplate: localizedTemplate,
    strategy: copy.strategy,
    hooks: [
      signal.opener,
      signal.secondaryHook,
      signal.productReveal,
      signal.proofLine,
      signal.cta,
    ],
    scripts: [
      {
        id: "15s",
        name: copy.scriptNames.sprint,
        duration: "15s",
        hook: signal.opener,
        scenes: scenes.slice(0, 4),
        cta: signal.cta,
        tone: signal.tone,
      },
      {
        id: "25s",
        name: copy.scriptNames.proof,
        duration: "25s",
        hook: signal.secondaryHook || selectedTemplate.opening,
        scenes,
        cta: signal.cta,
        tone: signal.tone,
      },
    ],
    storyboard: scenes,
    shotList: copy.shotList,
    captions: [
      ...signal.captions,
      signal.culturalNote,
      signal.cta,
    ],
    voiceover: signal.voiceover,
    aiVideoPrompts: copy.aiVideoPrompts,
    compliance: copy.compliance,
    testingPlan: copy.testingPlan,
  };
}

function mergeParsed(base: PetAdPack, parsed: ParsedAdPack | null): PetAdPack {
  if (!parsed) return base;

  return {
    ...base,
    targetMarket: normalizeTargetMarket(parsed.targetMarket || base.targetMarket),
    localization: getMarketProfile(parsed.targetMarket || base.targetMarket),
    strategy: parsed.strategy || base.strategy,
    hooks: Array.isArray(parsed.hooks) && parsed.hooks.length ? parsed.hooks.slice(0, 7) : base.hooks,
    scripts: Array.isArray(parsed.scripts) && parsed.scripts.length ? parsed.scripts.slice(0, 3) : base.scripts,
    storyboard: Array.isArray(parsed.storyboard) && parsed.storyboard.length ? parsed.storyboard : base.storyboard,
    shotList: Array.isArray(parsed.shotList) && parsed.shotList.length ? parsed.shotList.slice(0, 10) : base.shotList,
    captions: Array.isArray(parsed.captions) && parsed.captions.length ? parsed.captions.slice(0, 8) : base.captions,
    voiceover: typeof parsed.voiceover === "string" && parsed.voiceover ? parsed.voiceover : base.voiceover,
    aiVideoPrompts:
      Array.isArray(parsed.aiVideoPrompts) && parsed.aiVideoPrompts.length
        ? parsed.aiVideoPrompts.slice(0, 6)
        : base.aiVideoPrompts,
    compliance: parsed.compliance || base.compliance,
    testingPlan:
      Array.isArray(parsed.testingPlan) && parsed.testingPlan.length ? parsed.testingPlan.slice(0, 5) : base.testingPlan,
  };
}

export async function generatePetAdPack(product: Product, options: PetAdPackOptions = {}): Promise<PetAdPack> {
  const base = fallbackPack(product, options);
  const client = getClient();
  if (!client) return base;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You create structured ecommerce ad packs for pet cleaning products. Always return valid JSON only. ${base.localization.creatorVoiceReference}.`,
        },
        { role: "user", content: buildPrompt(product, base, options) },
      ],
      temperature: 0.72,
      max_tokens: 4200,
    });

    const text = completion.choices[0]?.message?.content || "";
    return mergeParsed(base, parseResponse(text));
  } catch (error) {
    console.error("Pet ad pack generation error:", error);
    return base;
  }
}
