/**
 * Video intake system - analyzes user-submitted videos and stores qualifying ones
 */

import OpenAI from "openai";
import { supabase } from "./supabase";
import type { TrendingVideo, VideoAnalysis, VideoScene } from "./types";
import { inferVideoMarketPlaybook } from "./market-intelligence";
import { normalizeTargetMarket } from "@/lib/localization/markets";

const client = new OpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.DASHSCOPE_API_KEY || "",
});

const MODEL = "qwen-plus";
// Minimum thresholds for a video to qualify for the template library
const QUALIFICATION_THRESHOLDS = {
  minViews: 10000,        // At least 10k views
  minLikes: 500,          // At least 500 likes
  minEngagement: 0.02,    // At least 2% engagement rate
  minDuration: 10,        // At least 10 seconds
  maxDuration: 120,       // At most 2 minutes
};

type VideoInput = {
  url: string;
  title?: string;
  author?: string;
  category?: string;
  userNote?: string;
  targetMarket?: string;
  // User-provided metrics (when scraping fails)
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
};

type AnalysisResult = {
  video: TrendingVideo;
  analysis: VideoAnalysis;
  qualified: boolean;
  reason?: string;
};

function marketToCountryCode(targetMarket?: string): string {
  const market = normalizeTargetMarket(targetMarket);
  if (market === "en-US") return "US";
  if (market === "en-GB") return "GB";
  if (market === "pt-BR") return "BR";
  if (market === "vi") return "VN";
  if (market === "ja") return "JP";
  return market.toUpperCase();
}

// Extract video ID from various TikTok URL formats
function extractVideoId(url: string): string | null {
  // https://www.tiktok.com/@username/video/1234567890
  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tiktokMatch) return tiktokMatch[1];

  // https://vm.tiktok.com/abc123/
  const vmMatch = url.match(/vm\.tiktok\.com\/(\w+)/);
  if (vmMatch) return vmMatch[1];

  // TikTok Creative Center: https://ads.tiktok.com/business/creativecenter/topads/1234567890
  const creativeCenterMatch = url.match(/ads\.tiktok\.com\/business\/creativecenter\/(?:topads|pc\/creativecenter\/adDetail)\/(\d+)/);
  if (creativeCenterMatch) return `cc_${creativeCenterMatch[1]}`;

  // Generic video ID pattern (15+ digits)
  const genericMatch = url.match(/(?:video[\/=]|detail\/)(\d{15,})/i);
  if (genericMatch) return genericMatch[1];

  // Any long number in URL
  const numberMatch = url.match(/(\d{18,})/);
  if (numberMatch) return numberMatch[1];

  return null;
}

// Detect pet cleaning category from title/description
function detectPetCategory(text: string): string {
  const lower = text.toLowerCase();

  // English keywords
  if (lower.includes("litter") && (lower.includes("odor") || lower.includes("smell") || lower.includes("deodor"))) {
    return "cat_litter";
  }
  if (lower.includes("urine") || lower.includes("pee") || lower.includes("enzyme")) {
    return "cat_urine_cleaner";
  }
  if (lower.includes("hair") || lower.includes("fur") || lower.includes("lint") || lower.includes("shedding")) {
    return "pet_hair_remover";
  }
  if (lower.includes("litter") && lower.includes("mat")) {
    return "litter_mat";
  }
  if (lower.includes("automatic") || lower.includes("self-clean") || lower.includes("smart litter")) {
    return "automatic_litter_box";
  }
  if (lower.includes("bath") || lower.includes("groom") || lower.includes("shampoo")) {
    return "pet_bathing";
  }
  if (lower.includes("paw") || lower.includes("muddy")) {
    return "paw_cleanup";
  }
  if (lower.includes("stain") || lower.includes("carpet")) {
    return "pet_stain_removal";
  }
  if (lower.includes("toy") || lower.includes("sanitiz")) {
    return "pet_toys_cleaning";
  }
  if (lower.includes("aquarium") || lower.includes("fish tank") || lower.includes("algae")) {
    return "aquarium_cleaning";
  }
  if (lower.includes("fabric") || lower.includes("sofa") || lower.includes("couch") || lower.includes("pet bed")) {
    return "fabric_odor_control";
  }
  if (lower.includes("pad") || lower.includes("floor") || lower.includes("puppy")) {
    return "dog_pad_cleanup";
  }

  // Chinese keywords
  if (lower.includes("猫砂") && (lower.includes("除臭") || lower.includes("异味") || lower.includes("臭"))) {
    return "cat_litter";
  }
  if (lower.includes("猫尿") || lower.includes("尿渍") || lower.includes("酶")) {
    return "cat_urine_cleaner";
  }
  if (lower.includes("毛发") || lower.includes("除毛") || lower.includes("粘毛") || lower.includes("掉毛")) {
    return "pet_hair_remover";
  }
  if (lower.includes("猫砂垫") || lower.includes("带出")) {
    return "litter_mat";
  }
  if (lower.includes("自动猫砂盆") || lower.includes("智能猫砂盆") || lower.includes("自清洁")) {
    return "automatic_litter_box";
  }
  if (lower.includes("洗澡") || lower.includes("沐浴") || lower.includes("香波") || lower.includes("洗护")) {
    return "pet_bathing";
  }
  if (lower.includes("洗脚") || lower.includes("脚掌") || lower.includes("遛狗")) {
    return "paw_cleanup";
  }
  if (lower.includes("污渍") || lower.includes("地毯") || lower.includes("去渍")) {
    return "pet_stain_removal";
  }
  if (lower.includes("玩具") && (lower.includes("清洁") || lower.includes("消毒"))) {
    return "pet_toys_cleaning";
  }
  if (lower.includes("鱼缸") || lower.includes("水族") || lower.includes("除藻")) {
    return "aquarium_cleaning";
  }
  if (lower.includes("织物") || lower.includes("沙发") || lower.includes("布艺") || lower.includes("宠物床")) {
    return "fabric_odor_control";
  }
  if (lower.includes("尿垫") || lower.includes("狗垫") || lower.includes("训导垫") || lower.includes("狗狗")) {
    return "dog_pad_cleanup";
  }
  if (lower.includes("猫砂盆") || lower.includes("猫砂")) {
    return "cat_litter";
  }
  if (lower.includes("宠物") && lower.includes("清洁")) {
    return "pet_cleaning";
  }

  return "pet_cleaning";
}

// Analyze video with AI
async function analyzeVideo(video: TrendingVideo): Promise<VideoAnalysis> {
  if (!process.env.DASHSCOPE_API_KEY) {
    return fallbackAnalysis(video);
  }

  const prompt = `You are analyzing a TikTok pet cleaning video ad. Based on the available information, extract creative insights and patterns that would be useful for creating similar ads.

Available Information:
- Video URL: ${video.video_url}
- Title: ${video.title || "Unknown - please infer from context"}
- Creator: ${video.author_name || "Unknown"}
- Views: ${video.view_count > 0 ? video.view_count.toLocaleString() : "Unknown"}
- Likes: ${video.like_count > 0 ? video.like_count.toLocaleString() : "Unknown"}
- Duration: ${video.duration_seconds ? `${video.duration_seconds}s` : "Unknown"}
- Category: ${video.product_category || "pet_cleaning"}
- Likely high-play market: ${inferVideoMarketPlaybook(video).primaryMarketLabel}

If the title is missing, analyze the URL structure to infer what type of pet cleaning product this might be about (e.g., cat litter, dog pads, pet hair remover, etc.).

Return JSON with this structure:
{
  "hooks": ["hook pattern 1", "hook pattern 2", "hook pattern 3"],
  "video_structure": [
    {"time": "0-3s", "description": "Opening scene"},
    {"time": "3-8s", "description": "Problem setup"},
    {"time": "8-15s", "description": "Product demo"},
    {"time": "15-22s", "description": "Result/showcase"},
    {"time": "22-30s", "description": "CTA"}
  ],
  "cta_patterns": ["CTA 1", "CTA 2"],
  "tone_style": "Description of tone and style",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "inferred_category": "best guess category based on all available info"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a TikTok pet cleaning ad creative expert. Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = parseJson(text);

    if (parsed?.hooks && parsed?.video_structure) {
      // Use inferred category if available and current category is generic
      if (parsed.inferred_category && video.product_category === "pet_cleaning") {
        video.product_category = detectPetCategory(parsed.inferred_category as string);
      }
      const playbook = inferVideoMarketPlaybook(video);

      return {
        id: "",
        video_id: video.id,
        hooks: Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, 5) : fallbackAnalysis(video).hooks,
        video_structure: Array.isArray(parsed.video_structure)
          ? (parsed.video_structure as VideoScene[]).slice(0, 8)
          : fallbackAnalysis(video).video_structure,
        cta_patterns: Array.isArray(parsed.cta_patterns) ? (parsed.cta_patterns as string[]).slice(0, 5) : [],
        tone_style: typeof parsed.tone_style === "string" ? parsed.tone_style : null,
        engagement_score: calcEngagement(video),
        key_takeaways: [
          ...(Array.isArray(parsed.key_takeaways) ? (parsed.key_takeaways as string[]).slice(0, 5) : []),
          `Best market signal: ${playbook.primaryMarketLabel}. Use: ${playbook.hookAngle}`,
        ],
        market_playbook: playbook,
        analysis_model: MODEL,
        analyzed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.error("Video analysis error:", e);
  }

  return fallbackAnalysis(video);
}

function fallbackAnalysis(video: TrendingVideo): VideoAnalysis {
  const playbook = inferVideoMarketPlaybook(video);
  return {
    id: "",
    video_id: video.id,
    hooks: [
      `Stop scrolling! You need this ${video.product_category || "pet"} cleaning hack`,
      `POV: You just found the best ${video.product_category || "pet"} cleaner`,
      `This changed my pet cleaning routine forever`,
    ],
    video_structure: [
      { time: "0-3s", description: "Attention hook with problem statement" },
      { time: "3-8s", description: "Show the messy/dirty situation" },
      { time: "8-15s", description: "Introduce the cleaning product" },
      { time: "15-22s", description: "Demonstrate the cleaning process" },
      { time: "22-30s", description: "Show the clean result and CTA" },
    ],
    cta_patterns: ["Link in bio", "Comment for details", "Save this for later"],
    tone_style: "Relatable pet parent, authentic and practical",
    engagement_score: calcEngagement(video),
    key_takeaways: [
      "Lead with a relatable pet owner problem",
      "Show the cleaning process clearly",
      "End with a satisfying result",
      `Best market signal: ${playbook.primaryMarketLabel}. Use: ${playbook.hookAngle}`,
    ],
    market_playbook: playbook,
    analysis_model: "fallback",
    analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

function calcEngagement(video: TrendingVideo): number {
  // If view_count is 0 but we have likes, estimate view_count from likes
  // Typical TikTok like rate is around 5-15%, we use 8% as default
  const viewCount = video.view_count || (video.like_count > 0 ? Math.round(video.like_count / 0.08) : 0);

  if (!viewCount) return 0;
  return Math.round(((video.like_count + video.comment_count * 3 + video.share_count * 5) / viewCount) * 10000) / 100;
}

function parseJson(text: string): Record<string, unknown> | null {
  let jsonStr = text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();
  try { return JSON.parse(jsonStr); } catch {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) { try { return JSON.parse(objMatch[0]); } catch {} }
    return null;
  }
}

// Check if video qualifies for template library
function checkQualification(video: TrendingVideo, analysis: VideoAnalysis): { qualified: boolean; reason?: string } {
  // User-submitted videos always qualify if they have meaningful analysis
  if (video.source_period === "user_submit") {
    if (analysis.hooks.length < 2) {
      return { qualified: false, reason: "Not enough hooks extracted" };
    }
    if (analysis.video_structure.length < 3) {
      return { qualified: false, reason: "Video structure too short" };
    }
    return { qualified: true };
  }

  // For scraped videos, apply strict thresholds
  const engagement = calcEngagement(video);

  if (video.view_count < QUALIFICATION_THRESHOLDS.minViews) {
    return { qualified: false, reason: `Views too low (${video.view_count} < ${QUALIFICATION_THRESHOLDS.minViews})` };
  }

  if (video.like_count < QUALIFICATION_THRESHOLDS.minLikes) {
    return { qualified: false, reason: `Likes too low (${video.like_count} < ${QUALIFICATION_THRESHOLDS.minLikes})` };
  }

  if (engagement < QUALIFICATION_THRESHOLDS.minEngagement * 100) {
    return { qualified: false, reason: `Engagement too low (${engagement}% < ${QUALIFICATION_THRESHOLDS.minEngagement * 100}%)` };
  }

  if (video.duration_seconds && video.duration_seconds < QUALIFICATION_THRESHOLDS.minDuration) {
    return { qualified: false, reason: `Duration too short (${video.duration_seconds}s < ${QUALIFICATION_THRESHOLDS.minDuration}s)` };
  }

  if (video.duration_seconds && video.duration_seconds > QUALIFICATION_THRESHOLDS.maxDuration) {
    return { qualified: false, reason: `Duration too long (${video.duration_seconds}s > ${QUALIFICATION_THRESHOLDS.maxDuration}s)` };
  }

  // Check if analysis has meaningful content
  if (analysis.hooks.length < 2) {
    return { qualified: false, reason: "Not enough hooks extracted" };
  }

  if (analysis.video_structure.length < 3) {
    return { qualified: false, reason: "Video structure too short" };
  }

  return { qualified: true };
}

// Save video and analysis to database
async function saveToDatabase(video: TrendingVideo, analysis: VideoAnalysis): Promise<boolean> {
  if (!supabase) return false;

  try {
    // Upsert video
    const { error: videoError } = await supabase
      .from("trending_videos")
      .upsert({
        id: video.id,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        title: video.title,
        author_name: video.author_name,
        author_avatar: video.author_avatar,
        product_category: video.product_category,
        view_count: video.view_count,
        like_count: video.like_count,
        comment_count: video.comment_count,
        share_count: video.share_count,
        country_code: video.country_code,
        hashtags: video.hashtags,
        duration_seconds: video.duration_seconds,
        scraped_at: video.scraped_at,
        source_period: video.source_period,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id", ignoreDuplicates: false });

    if (videoError) {
      console.error("Save video error:", videoError);
      return false;
    }

    // Upsert analysis
    const { error: analysisError } = await supabase
      .from("video_analyses")
      .upsert({
        video_id: analysis.video_id,
        hooks: analysis.hooks,
        video_structure: analysis.video_structure,
        cta_patterns: analysis.cta_patterns,
        tone_style: analysis.tone_style,
        engagement_score: analysis.engagement_score,
        key_takeaways: analysis.key_takeaways,
        analysis_model: analysis.analysis_model,
        analyzed_at: analysis.analyzed_at,
      }, { onConflict: "video_id", ignoreDuplicates: false });

    if (analysisError) {
      console.error("Save analysis error:", analysisError);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Database save error:", e);
    return false;
  }
}

// Update knowledge base for a category
async function updateKnowledgeBase(category: string): Promise<void> {
  if (!supabase) return;

  try {
    // Get all videos and analyses for this category
    const { data: videos } = await supabase
      .from("trending_videos")
      .select("*")
      .eq("product_category", category);

    if (!videos || videos.length === 0) return;

    const { data: analyses } = await supabase
      .from("video_analyses")
      .select("*")
      .in("video_id", videos.map(v => v.id));

    if (!analyses || analyses.length === 0) return;

    // Aggregate hooks
    const hookCounts = new Map<string, { count: number; totalEngagement: number }>();
    for (const analysis of analyses) {
      const hooks = analysis.hooks as string[];
      for (const hook of hooks) {
        const existing = hookCounts.get(hook) || { count: 0, totalEngagement: 0 };
        existing.count++;
        existing.totalEngagement += analysis.engagement_score || 0;
        hookCounts.set(hook, existing);
      }
    }

    const hookPatterns = Array.from(hookCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([pattern, data]) => ({
        pattern: pattern.length > 50 ? pattern.slice(0, 50) + "..." : pattern,
        example: pattern,
        frequency: data.count,
        avg_engagement: Math.round(data.totalEngagement / data.count * 100) / 100,
      }));

    // Aggregate structures
    const structures = analyses.slice(0, 5).map((a, i) => ({
      name: `Structure ${i + 1}`,
      scenes: a.video_structure as { time: string; description: string }[],
      best_for: category,
    }));

    // Aggregate CTAs
    const ctaCounts = new Map<string, number>();
    for (const analysis of analyses) {
      const ctas = analysis.cta_patterns as string[];
      for (const cta of ctas) {
        ctaCounts.set(cta, (ctaCounts.get(cta) || 0) + 1);
      }
    }
    const ctaTemplates = Array.from(ctaCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cta]) => cta);

    // Aggregate tones
    const toneCounts = new Map<string, number>();
    for (const analysis of analyses) {
      if (analysis.tone_style) {
        toneCounts.set(analysis.tone_style, (toneCounts.get(analysis.tone_style) || 0) + 1);
      }
    }
    const toneProfiles = Array.from(toneCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tone]) => tone);

    // Aggregate hashtags
    const hashtagCounts = new Map<string, number>();
    for (const video of videos) {
      const tags = video.hashtags as string[];
      for (const tag of tags) {
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
      }
    }
    const topHashtags = Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);

    // Calculate averages
    const avgDuration = Math.round(videos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / videos.length);
    const avgEngagement = analyses.reduce((sum, a) => sum + (a.engagement_score || 0), 0) / analyses.length;

    // Generate summary
    const topTakeaways = analyses.flatMap(a => a.key_takeaways as string[]).slice(0, 5);
    const summary = `Analysis of ${videos.length} pet cleaning videos in the ${category} category. Top performing content uses ${hookPatterns[0]?.pattern || "relatable"} hooks. Key insight: ${topTakeaways[0] || "Lead with a clear problem-solution narrative."}`;

    // Upsert knowledge entry
    await supabase
      .from("knowledge_base")
      .upsert({
        category,
        hook_patterns: hookPatterns,
        structure_templates: structures,
        cta_templates: ctaTemplates,
        tone_profiles: toneProfiles,
        top_hashtags: topHashtags,
        avg_duration: avgDuration,
        engagement_benchmarks: [
          { metric: "avg_engagement", value: Math.round(avgEngagement * 100) / 100 },
          { metric: "total_videos", value: videos.length },
          { metric: "avg_views", value: Math.round(videos.reduce((s, v) => s + v.view_count, 0) / videos.length) },
        ],
        summary,
        video_count: videos.length,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "category", ignoreDuplicates: false });

    console.log(`Updated knowledge base for ${category} (${videos.length} videos)`);
  } catch (e) {
    console.error(`Error updating knowledge base for ${category}:`, e);
  }
}

// Fetch video metadata from URL
async function fetchVideoMetadata(url: string): Promise<{
  title?: string;
  author?: string;
  thumbnail_url?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  duration?: number;
  country_code?: string;
  hashtags?: string[];
} | null> {
  // Method 1: Try TikTok oEmbed API first (fast, reliable, but no metrics)
  let oembedData: any = null;
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      oembedData = await response.json();
    }
  } catch {
    // oEmbed failed
  }

  // Method 2: Try scraping from TikTok page (for metrics)
  let metrics: { view_count?: number; like_count?: number; comment_count?: number; share_count?: number } = {};
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": "tt_webid=7106594312292453675",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const html = await response.text();

      // Try __UNIVERSAL_DATA_FOR_REHYDRATION__
      const universalDataMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (universalDataMatch) {
        try {
          const data = JSON.parse(universalDataMatch[1]);
          const videoDetail = data?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;
          if (videoDetail?.stats) {
            metrics = {
              view_count: videoDetail.stats.playCount || 0,
              like_count: videoDetail.stats.diggCount || 0,
              comment_count: videoDetail.stats.commentCount || 0,
              share_count: videoDetail.stats.shareCount || 0,
            };
          }
        } catch {}
      }

      // Try SIGI_STATE if no metrics yet
      if (!metrics.view_count) {
        const sigiMatch = html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/);
        if (sigiMatch) {
          try {
            const data = JSON.parse(sigiMatch[1]);
            const itemModule = data?.ItemModule;
            if (itemModule) {
              const videoId = Object.keys(itemModule)[0];
              const videoDetail = itemModule[videoId];
              if (videoDetail?.stats) {
                metrics = {
                  view_count: videoDetail.stats.playCount || 0,
                  like_count: videoDetail.stats.diggCount || 0,
                  comment_count: videoDetail.stats.commentCount || 0,
                  share_count: videoDetail.stats.shareCount || 0,
                };
              }
            }
          } catch {}
        }
      }
    }
  } catch {
    // Page scraping failed (timeout or network error)
  }

  // Combine results
  if (oembedData?.title || metrics.view_count) {
    return {
      title: oembedData?.title || undefined,
      author: oembedData?.author_name || undefined,
      thumbnail_url: oembedData?.thumbnail_url || undefined,
      ...metrics,
    };
  }

  // For Creative Center URLs, try to extract from the URL itself
  if (url.includes("ads.tiktok.com/business/creativecenter")) {
    const idMatch = url.match(/\/(\d{18,})/);
    if (idMatch) {
      return {
        title: `TikTok Creative Center Ad ${idMatch[1]}`,
      };
    }
  }

  return null;
}

// Analyze URL with AI to infer video content
async function analyzeUrlWithAI(url: string, userNote?: string): Promise<{
  title?: string;
  category?: string;
  description?: string;
} | null> {
  if (!process.env.DASHSCOPE_API_KEY) return null;

  try {
    // Extract useful info from URL
    const username = url.match(/@([\w.-]+)/)?.[1] || "";
    const videoId = url.match(/video\/(\d+)/)?.[1] || "";

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `你是一个宠物清洁产品专家，专门分析TikTok上的宠物清洁产品视频。

你的任务是根据有限的线索（用户名、视频ID、URL特征）推断视频最可能展示的宠物清洁产品。

常见宠物清洁产品类别：
- pet_bathing: 宠物洗澡用品（喷头、刷子、沐浴露、按摩刷、搓澡神器）
- pet_hair_remover: 宠物除毛器（粘毛滚筒、除毛刷、电动除毛器）
- cat_litter: 猫砂相关（猫砂盆、猫砂、除臭剂）
- dog_pad_cleanup: 狗狗尿垫、训导垫
- pet_stain_removal: 宠物污渍清洁剂（地毯、沙发清洁）
- cat_urine_cleaner: 猫尿清洁剂（生物酶分解）
- fabric_odor_control: 织物除臭（沙发、宠物床）
- paw_cleanup: 宠物洗脚器、湿巾
- automatic_litter_box: 自动猫砂盆
- litter_mat: 猫砂垫
- pet_toys_cleaning: 宠物玩具清洁
- aquarium_cleaning: 鱼缸清洁

分析技巧：
1. 如果用户名包含"pet"、"dog"、"cat"等词，可能与宠物相关
2. 如果用户名是品牌名（如petsgoodis.com），可能是该品牌的热门产品
3. 视频ID格式可以暗示发布时间，但不能直接推断内容
4. 结合用户提供的补充信息会更准确

请用JSON格式回答。`
        },
        {
          role: "user",
          content: `请分析这个TikTok视频链接，推断视频内容：

视频URL: ${url}
用户名: ${username || "未知"}
视频ID: ${videoId || "未知"}
用户补充信息: ${userNote || "无"}

根据以上信息，推断这个视频最可能是关于什么宠物清洁产品的？

请用JSON格式回答：
{
  "title": "推断的产品标题（中文，具体描述产品功能）",
  "category": "类别（必须是以下之一：cat_litter, cat_urine_cleaner, pet_hair_remover, litter_mat, automatic_litter_box, pet_bathing, paw_cleanup, pet_stain_removal, pet_toys_cleaning, aquarium_cleaning, fabric_odor_control, dog_pad_cleanup, pet_cleaning）",
  "confidence": "置信度（high/medium/low）",
  "description": "详细推断依据"
}`
        }
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = parseJson(text);

    if (parsed?.category) {
      return {
        title: parsed.title as string,
        category: parsed.category as string,
        description: parsed.description as string,
      };
    }
  } catch (e) {
    console.error("URL analysis error:", e);
  }

  return null;
}

// Main intake function
export async function intakeVideo(input: VideoInput): Promise<AnalysisResult> {
  const videoId = extractVideoId(input.url);

  // Try to fetch video metadata from URL
  const metadata = await fetchVideoMetadata(input.url);

  // If no title from metadata, use AI to analyze the URL
  let aiAnalysis = null;
  if (!metadata?.title && !input.title) {
    aiAnalysis = await analyzeUrlWithAI(input.url, input.userNote);
  }

  // Determine category from available sources
  const categorySources = [
    input.category,
    aiAnalysis?.category,
    detectPetCategory(`${input.title || ""} ${input.userNote || ""}`),
    detectPetCategory(`${metadata?.title || ""} ${aiAnalysis?.title || ""}`),
  ].filter(Boolean);

  const finalCategory = categorySources[0] || "pet_cleaning";

  // Create video object - use scraped metrics or user-provided metrics
  const video: TrendingVideo = {
    id: videoId || `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    video_url: input.url,
    thumbnail_url: metadata?.thumbnail_url || null,
    title: input.title || metadata?.title || aiAnalysis?.title || null,
    author_name: input.author || metadata?.author || null,
    author_avatar: null,
    product_category: finalCategory,
    // Priority: scraped metadata > user-provided > default 0
    view_count: metadata?.view_count || input.viewCount || 0,
    like_count: metadata?.like_count || input.likeCount || 0,
    comment_count: metadata?.comment_count || input.commentCount || 0,
    share_count: metadata?.share_count || input.shareCount || 0,
    country_code: metadata?.country_code || marketToCountryCode(input.targetMarket),
    hashtags: metadata?.hashtags || [],
    duration_seconds: metadata?.duration || null,
    scraped_at: new Date().toISOString(),
    source_period: "user_submit",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  video.market_playbook = inferVideoMarketPlaybook(video, input.targetMarket);

  // Analyze video
  const analysis = await analyzeVideo(video);
  analysis.market_playbook = analysis.market_playbook || video.market_playbook;

  // Check qualification
  const { qualified, reason } = checkQualification(video, analysis);

  // Save to database regardless of qualification (for learning)
  await saveToDatabase(video, analysis);

  // If qualified, update knowledge base
  if (qualified && video.product_category) {
    await updateKnowledgeBase(video.product_category);
  }

  return {
    video,
    analysis,
    qualified,
    reason,
  };
}

// Batch intake multiple videos
export async function intakeVideos(inputs: VideoInput[]): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];

  for (const input of inputs) {
    try {
      const result = await intakeVideo(input);
      results.push(result);

      // Rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`Error processing video ${input.url}:`, e);
      results.push({
        video: {
          id: `error_${Date.now()}`,
          video_url: input.url,
          thumbnail_url: null,
          title: input.title || null,
          author_name: input.author || null,
          author_avatar: null,
          product_category: input.category || "pet_cleaning",
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          share_count: 0,
          country_code: "US",
          hashtags: [],
          duration_seconds: null,
          scraped_at: new Date().toISOString(),
          source_period: "user_submit",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        analysis: fallbackAnalysis({
          id: "error",
          video_url: input.url,
          title: input.title,
          product_category: input.category,
        } as TrendingVideo),
        qualified: false,
        reason: `Analysis failed: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }

  return results;
}

// Get intake statistics
export async function getIntakeStats(): Promise<{
  totalVideos: number;
  qualifiedVideos: number;
  categories: { category: string; count: number }[];
}> {
  if (!supabase) {
    return { totalVideos: 0, qualifiedVideos: 0, categories: [] };
  }

  const { count: totalVideos } = await supabase
    .from("trending_videos")
    .select("id", { count: "exact", head: true })
    .eq("source_period", "user_submit");

  // Count videos with good engagement as "qualified"
  const { data: videos } = await supabase
    .from("trending_videos")
    .select("product_category, view_count, like_count")
    .eq("source_period", "user_submit");

  let qualifiedVideos = 0;
  const categoryCounts = new Map<string, number>();

  for (const video of videos || []) {
    const engagement = video.view_count > 0
      ? ((video.like_count * 1.5) / video.view_count) * 100
      : 0;

    if (video.view_count >= QUALIFICATION_THRESHOLDS.minViews &&
        video.like_count >= QUALIFICATION_THRESHOLDS.minLikes &&
        engagement >= QUALIFICATION_THRESHOLDS.minEngagement * 100) {
      qualifiedVideos++;
    }

    const cat = video.product_category || "unknown";
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  }

  const categories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalVideos: totalVideos || 0,
    qualifiedVideos,
    categories,
  };
}
