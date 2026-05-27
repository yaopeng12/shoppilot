import OpenAI from "openai";
import type { TrendingVideo, VideoAnalysis } from "./types";
import { supabase } from "./supabase";

const client = new OpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.DASHSCOPE_API_KEY || "",
});

const MODEL = "qwen-plus";

type CategoryGroup = {
  category: string;
  videos: TrendingVideo[];
  analyses: VideoAnalysis[];
};

type KnowledgeTemplate = {
  category: string;
  hook_patterns: HookPattern[];
  structure_templates: StructureTemplate[];
  cta_templates: string[];
  tone_profiles: string[];
  top_hashtags: string[];
  avg_duration: number;
  engagement_benchmarks: { metric: string; value: number }[];
  summary: string;
};

type HookPattern = {
  pattern: string;
  example: string;
  frequency: number;
  avg_engagement: number;
};

type StructureTemplate = {
  name: string;
  scenes: { time: string; description: string }[];
  best_for: string;
};

function groupByCategory(
  videos: TrendingVideo[],
  analyses: VideoAnalysis[],
): CategoryGroup[] {
  const analysisMap = new Map(analyses.map((a) => [a.video_id, a]));
  const groups = new Map<string, { videos: TrendingVideo[]; analyses: VideoAnalysis[] }>();

  for (const v of videos) {
    const cat = v.product_category || "General";
    if (!groups.has(cat)) groups.set(cat, { videos: [], analyses: [] });
    groups.get(cat)!.videos.push(v);
    const analysis = analysisMap.get(v.id);
    if (analysis) groups.get(cat)!.analyses.push(analysis);
  }

  return Array.from(groups.entries()).map(([category, data]) => ({
    category,
    ...data,
  }));
}

function buildBatchPrompt(group: CategoryGroup): string {
  const hookSamples = group.analyses
    .flatMap((a) => a.hooks)
    .slice(0, 30)
    .map((h) => `- "${h}"`)
    .join("\n");

  const ctaSamples = group.analyses
    .flatMap((a) => a.cta_patterns)
    .slice(0, 20)
    .map((c) => `- "${c}"`)
    .join("\n");

  const toneSamples = group.analyses
    .map((a) => a.tone_style)
    .filter(Boolean)
    .slice(0, 15)
    .map((t) => `- ${t}`)
    .join("\n");

  const structureSamples = group.analyses
    .slice(0, 10)
    .map((a, i) => {
      const scenes = a.video_structure
        .map((s) => `[${s.time}] ${s.description}`)
        .join(" → ");
      return `${i + 1}. ${scenes}`;
    })
    .join("\n");

  const topVideos = group.videos
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 10)
    .map((v, i) => `${i + 1}. "${v.title}" — ${(v.view_count / 1_000_000).toFixed(1)}M views, ${v.duration_seconds || "?"}s`)
    .join("\n");

  return `You are a TikTok advertising strategist. Analyze the following data from ${group.videos.length} trending TikTok videos in the "${group.category}" category and extract reusable creative templates.

TOP PERFORMING VIDEOS:
${topVideos}

HOOK PATTERNS (from AI analysis of these videos):
${hookSamples || "N/A"}

CTA PATTERNS:
${ctaSamples || "N/A"}

TONE STYLES:
${toneSamples || "N/A"}

VIDEO STRUCTURES:
${structureSamples || "N/A"}

Return a JSON object with exactly this structure (no markdown, pure JSON only):
{
  "hook_patterns": [
    {
      "pattern": "Pattern name (e.g., 'Curiosity Gap')",
      "example": "Example hook text using this pattern",
      "frequency": 8,
      "avg_engagement": 12.5
    }
  ],
  "structure_templates": [
    {
      "name": "Template name (e.g., 'Problem → Solution → Proof')",
      "scenes": [
        {"time": "0-3s", "description": "Scene description"},
        {"time": "3-8s", "description": "Scene description"},
        {"time": "8-15s", "description": "Scene description"},
        {"time": "15-25s", "description": "Scene description"},
        {"time": "25-30s", "description": "Scene description"}
      ],
      "best_for": "What product types this works best for"
    }
  ],
  "cta_templates": [
    "Most effective CTA pattern 1",
    "Most effective CTA pattern 2",
    "Most effective CTA pattern 3"
  ],
  "tone_profiles": [
    "Dominant tone description 1",
    "Dominant tone description 2"
  ],
  "top_hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "summary": "2-3 sentence summary of what works in this category and why"
}

Requirements:
- hook_patterns: Identify the 5 most common hook patterns. Include a specific example for each.
- structure_templates: Provide 3 distinct video structure templates that work well in this category.
- cta_templates: Top 5 most effective CTAs.
- tone_profiles: 2-3 dominant creative tones in this category.
- top_hashtags: 10 most frequently used hashtags.
- summary: Concise strategic summary for advertisers in this category.`;
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

function fallbackTemplate(group: CategoryGroup): KnowledgeTemplate {
  return {
    category: group.category,
    hook_patterns: [
      { pattern: "Curiosity Gap", example: `You won't believe what this ${group.category} product does...`, frequency: 0, avg_engagement: 0 },
      { pattern: "Problem-Solution", example: `Struggling with ${group.category}? Try this.`, frequency: 0, avg_engagement: 0 },
      { pattern: "Social Proof", example: `Everyone is buying this ${group.category} product`, frequency: 0, avg_engagement: 0 },
    ],
    structure_templates: [
      {
        name: "Hook → Demo → CTA",
        scenes: [
          { time: "0-3s", description: "Attention-grabbing hook" },
          { time: "3-10s", description: "Show the product" },
          { time: "10-20s", description: "Demo in action" },
          { time: "20-25s", description: "Results/benefits" },
          { time: "25-30s", description: "Call to action" },
        ],
        best_for: group.category,
      },
    ],
    cta_templates: ["Link in bio", "Comment for details", "Follow for more"],
    tone_profiles: ["Casual and authentic", "Enthusiastic and urgent"],
    top_hashtags: [],
    avg_duration: 0,
    engagement_benchmarks: [],
    summary: `Trending patterns for ${group.category} on TikTok.`,
  };
}

async function analyzeCategoryGroup(group: CategoryGroup): Promise<KnowledgeTemplate> {
  if (!process.env.DASHSCOPE_API_KEY || group.analyses.length < 3) {
    return fallbackTemplate(group);
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a TikTok advertising strategist. Always respond with valid JSON only, no markdown formatting.",
        },
        { role: "user", content: buildBatchPrompt(group) },
      ],
      temperature: 0.6,
      max_tokens: 2500,
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = parseResponse(text);

    if (parsed) {
      const avgDuration = group.videos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / group.videos.length;
      return {
        category: group.category,
        hook_patterns: Array.isArray(parsed.hook_patterns) ? parsed.hook_patterns as HookPattern[] : [],
        structure_templates: Array.isArray(parsed.structure_templates) ? parsed.structure_templates as StructureTemplate[] : [],
        cta_templates: Array.isArray(parsed.cta_templates) ? parsed.cta_templates as string[] : [],
        tone_profiles: Array.isArray(parsed.tone_profiles) ? parsed.tone_profiles as string[] : [],
        top_hashtags: Array.isArray(parsed.top_hashtags) ? parsed.top_hashtags as string[] : [],
        avg_duration: Math.round(avgDuration),
        engagement_benchmarks: [],
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
      };
    }
  } catch (e) {
    console.error("Batch analysis error:", e);
  }

  return fallbackTemplate(group);
}

export async function generateKnowledgeBase(
  videos: TrendingVideo[],
  analyses: VideoAnalysis[],
): Promise<void> {
  if (!supabase) return;

  const groups = groupByCategory(videos, analyses);
  const templates: KnowledgeTemplate[] = [];

  for (const group of groups) {
    if (group.videos.length < 5) continue; // skip tiny groups
    const template = await analyzeCategoryGroup(group);
    templates.push(template);
  }

  // Store each template in the knowledge_base table
  for (const tpl of templates) {
    await supabase
      .from("knowledge_base")
      .upsert(
        {
          category: tpl.category,
          hook_patterns: tpl.hook_patterns,
          structure_templates: tpl.structure_templates,
          cta_templates: tpl.cta_templates,
          tone_profiles: tpl.tone_profiles,
          top_hashtags: tpl.top_hashtags,
          avg_duration: tpl.avg_duration,
          engagement_benchmarks: tpl.engagement_benchmarks,
          summary: tpl.summary,
          video_count: groups.find((g) => g.category === tpl.category)?.videos.length || 0,
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "category" },
      );
  }
}
