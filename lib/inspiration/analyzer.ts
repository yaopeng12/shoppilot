import OpenAI from "openai";
import type { TrendingVideo, VideoAnalysis, VideoScene } from "./types";

const client = new OpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.DASHSCOPE_API_KEY || "",
});

const MODEL = "qwen-plus";

function buildAnalysisPrompt(video: TrendingVideo): string {
  return `You are a TikTok advertising expert and creative analyst. Analyze the following trending TikTok product video and extract actionable creative insights.

Video Title: ${video.title || "N/A"}
Creator: ${video.author_name || "N/A"}
Views: ${video.view_count.toLocaleString()}
Likes: ${video.like_count.toLocaleString()}
Comments: ${video.comment_count.toLocaleString()}
Shares: ${video.share_count.toLocaleString()}
Duration: ${video.duration_seconds || "N/A"}s
Hashtags: ${(video.hashtags || []).join(", ") || "N/A"}
Category: ${video.product_category || "N/A"}

Return a JSON object with exactly this structure (no markdown, no code fences, pure JSON only):
{
  "hooks": [
    "Extracted hook/opening line 1",
    "Extracted hook/opening line 2",
    "Extracted hook/opening line 3"
  ],
  "video_structure": [
    {"time": "0-3s", "description": "Opening scene description"},
    {"time": "3-8s", "description": "Next scene description"},
    {"time": "8-15s", "description": "Next scene description"},
    {"time": "15-25s", "description": "Next scene description"},
    {"time": "25-30s", "description": "Closing scene description"}
  ],
  "cta_patterns": [
    "CTA pattern 1",
    "CTA pattern 2"
  ],
  "tone_style": "Description of the overall tone, style, and emotional approach",
  "key_takeaways": [
    "Actionable takeaway 1 for advertisers",
    "Actionable takeaway 2",
    "Actionable takeaway 3"
  ]
}

Requirements:
- hooks: Extract or infer the opening hook patterns used. If the title contains the hook, extract it. Otherwise, infer the likely hook style from the video's success metrics.
- video_structure: Break down the video into 4-6 scenes with timestamps and descriptions of what likely happens in each scene.
- cta_patterns: Identify call-to-action patterns (e.g., "link in bio", "comment GUIDE", "follow for part 2").
- tone_style: Describe the creative tone (casual, humorous, urgent, educational, aspirational, etc.)
- key_takeaways: 3-5 actionable insights that a Shopify seller could use when creating their own TikTok ad for a similar product.`;
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
      try {
        return JSON.parse(objMatch[0]);
      } catch {}
    }
    return null;
  }
}

function calcEngagementScore(video: TrendingVideo): number {
  if (!video.view_count) return 0;
  const score =
    ((video.like_count + video.comment_count * 3 + video.share_count * 5) / video.view_count) * 100;
  return Math.round(score * 100) / 100;
}

function fallbackAnalysis(video: TrendingVideo): VideoAnalysis {
  const name = video.title || "this product";
  return {
    id: "",
    video_id: video.id,
    hooks: [
      `Stop scrolling! You need to see this ${name} hack`,
      `POV: You just discovered the best ${name}`,
      `I can't believe this ${name} actually works`,
    ],
    video_structure: [
      { time: "0-3s", description: "Attention-grabbing hook with text overlay" },
      { time: "3-8s", description: "Show the product or problem it solves" },
      { time: "8-15s", description: "Demonstrate the product in action" },
      { time: "15-25s", description: "Show results or key benefits" },
      { time: "25-30s", description: "CTA with link or follow prompt" },
    ],
    cta_patterns: ["Link in bio", "Comment for details", "Follow for more tips"],
    tone_style: "Casual, authentic, and relatable with a focus on genuine product experience",
    engagement_score: calcEngagementScore(video),
    key_takeaways: [
      "Lead with a strong visual hook in the first 3 seconds",
      "Show the product in real-use scenarios for authenticity",
      "Include a clear call-to-action at the end",
      "Use trending sounds or formats to boost discoverability",
    ],
    analysis_model: "fallback",
    analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

export async function analyzeVideo(video: TrendingVideo): Promise<VideoAnalysis> {
  if (!process.env.DASHSCOPE_API_KEY) {
    return fallbackAnalysis(video);
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a TikTok ad creative expert. Always respond with valid JSON only, no markdown formatting.",
        },
        { role: "user", content: buildAnalysisPrompt(video) },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = parseResponse(text);

    if (parsed?.hooks && parsed?.video_structure) {
      return {
        id: "",
        video_id: video.id,
        hooks: Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, 5) : fallbackAnalysis(video).hooks,
        video_structure: Array.isArray(parsed.video_structure)
          ? (parsed.video_structure as VideoScene[]).slice(0, 8)
          : fallbackAnalysis(video).video_structure,
        cta_patterns: Array.isArray(parsed.cta_patterns) ? (parsed.cta_patterns as string[]).slice(0, 5) : [],
        tone_style: typeof parsed.tone_style === "string" ? parsed.tone_style : null,
        engagement_score: calcEngagementScore(video),
        key_takeaways: Array.isArray(parsed.key_takeaways) ? (parsed.key_takeaways as string[]).slice(0, 5) : [],
        analysis_model: MODEL,
        analyzed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.error("DashScope analysis error:", e);
  }

  return fallbackAnalysis(video);
}

export async function analyzeVideos(videos: TrendingVideo[]): Promise<VideoAnalysis[]> {
  const results: VideoAnalysis[] = [];
  for (const video of videos) {
    const analysis = await analyzeVideo(video);
    results.push(analysis);
  }
  return results;
}
