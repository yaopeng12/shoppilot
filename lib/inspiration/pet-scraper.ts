import OpenAI from "openai";
import type { TrendingVideo, VideoAnalysis, VideoScene, KnowledgeEntry } from "./types";
import { supabase } from "./supabase";

const client = new OpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.DASHSCOPE_API_KEY || "",
});

const MODEL = "qwen-plus";

// Pet cleaning specific search queries for TikTok Creative Center
export const PET_CLEANING_QUERIES = [
  // Cat litter & odor
  "cat litter box odor",
  "cat litter deodorizer",
  "litter box smell",
  "cat litter mat tracking",
  "automatic litter box",
  "self cleaning litter box",
  // Cat urine cleanup
  "cat urine cleaner",
  "pet stain remover",
  "enzyme cleaner cat",
  "cat pee carpet",
  "pet accident cleanup",
  // Pet hair
  "pet hair remover",
  "dog hair sofa",
  "cat fur clothes",
  "lint roller pet",
  "pet hair vacuum",
  // Dog cleaning
  "dog bath time",
  "paw cleaner dog",
  "dog grooming",
  "puppy bath",
  "dog drying towel",
  // General pet cleaning
  "pet odor eliminator",
  "fabric pet smell",
  "pet bed cleaning",
  "pet toy cleaner",
  "pet safe floor cleaner",
];

// Category mapping for pet cleaning scenarios
export const PET_CATEGORY_MAP: Record<string, string> = {
  "cat litter": "cat_litter",
  "litter box": "cat_litter",
  "deodorizer": "cat_litter",
  "odor": "cat_litter",
  "cat urine": "cat_urine_cleaner",
  "urine cleaner": "cat_urine_cleaner",
  "enzyme cleaner": "cat_urine_cleaner",
  "stain remover": "pet_stain_removal",
  "litter mat": "litter_mat",
  "tracking mat": "litter_mat",
  "pet hair": "pet_hair_remover",
  "fur remover": "pet_hair_remover",
  "lint roller": "pet_hair_remover",
  "dog bath": "pet_bathing",
  "grooming": "pet_bathing",
  "paw cleaner": "paw_cleanup",
  "dog paw": "paw_cleanup",
  "automatic litter": "automatic_litter_box",
  "self cleaning litter": "automatic_litter_box",
  "aquarium": "aquarium_cleaning",
  "fish tank": "aquarium_cleaning",
  "pet toy": "pet_toys_cleaning",
};

export type ScrapeSource = {
  name: string;
  fetchVideos: (query: string, count: number) => Promise<TrendingVideo[]>;
};

// TikTok Creative Center API source
const tiktokCreativeCenterSource: ScrapeSource = {
  name: "tiktok-creative-center",
  fetchVideos: async (query: string, count: number) => {
    const videos: TrendingVideo[] = [];
    const seen = new Set<string>();

    try {
      const params = new URLSearchParams({
        period: "30",
        country_code: "US",
        limit: String(Math.min(count, 20)),
        page: "1",
        sort_by: "vv",
        keyword: query,
      });

      const res = await fetch(
        `https://ads.tiktok.com/creative_radar_api/v1/popular/video/list?${params}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
            Accept: "application/json",
            Referer: "https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en",
          },
          redirect: "follow",
        },
      );

      if (res.ok) {
        const data = await res.json() as any;
        const rawList = data?.data?.list || data?.data?.videos || [];

        for (const raw of rawList) {
          const id = raw.video_id || raw.id;
          if (!id || seen.has(String(id))) continue;
          seen.add(String(id));

          videos.push({
            id: String(id),
            video_url: raw.video_url || raw.url || `https://www.tiktok.com/@${raw.author_name}/video/${id}`,
            thumbnail_url: raw.thumbnail_url || raw.cover_url || null,
            title: raw.title || raw.video_title || null,
            author_name: raw.author_name || raw.creator_name || null,
            author_avatar: raw.author_avatar || null,
            product_category: detectCategory(raw.title || "", query),
            view_count: raw.view_count || raw.vv || 0,
            like_count: raw.like_count || raw.like_cnt || 0,
            comment_count: raw.comment_count || raw.comment_cnt || 0,
            share_count: raw.share_count || raw.share_cnt || 0,
            country_code: raw.country_code || raw.region || "US",
            hashtags: raw.hashtags || raw.tag_list || [],
            duration_seconds: raw.duration || raw.video_duration || null,
            scraped_at: new Date().toISOString(),
            source_period: "30d",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error(`TikTok API error for query "${query}":`, e);
    }

    return videos;
  },
};

// Web search fallback source (uses TikTok search page)
const webSearchSource: ScrapeSource = {
  name: "web-search",
  fetchVideos: async (query: string, count: number) => {
    const videos: TrendingVideo[] = [];

    try {
      // Try TikTok search page
      const searchUrl = `https://www.tiktok.com/api/search/general/full/?keyword=${encodeURIComponent(query + " pet cleaning")}&count=${count}`;
      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
        },
      });

      if (res.ok) {
        const data = await res.json() as any;
        const items = data?.data || [];

        for (const item of items) {
          if (item.type !== "video" || !item.video) continue;

          videos.push({
            id: item.video.id || `search_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            video_url: `https://www.tiktok.com/@${item.author?.unique_id}/video/${item.video.id}`,
            thumbnail_url: item.video.cover || null,
            title: item.title || null,
            author_name: item.author?.unique_id || null,
            author_avatar: item.author?.avatar || null,
            product_category: detectCategory(item.title || "", query),
            view_count: item.stats?.play_count || 0,
            like_count: item.stats?.digg_count || 0,
            comment_count: item.stats?.comment_count || 0,
            share_count: item.stats?.share_count || 0,
            country_code: "US",
            hashtags: item.textExtra?.map((e: any) => e.hashtagName).filter(Boolean) || [],
            duration_seconds: item.video.duration || null,
            scraped_at: new Date().toISOString(),
            source_period: "30d",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error(`Web search error for query "${query}":`, e);
    }

    return videos;
  },
};

function detectCategory(title: string, query: string): string {
  const text = `${title} ${query}`.toLowerCase();

  for (const [keyword, category] of Object.entries(PET_CATEGORY_MAP)) {
    if (text.includes(keyword)) return category;
  }

  return "pet_cleaning";
}

// Web search based scraper using multiple sources
const webScraperSource: ScrapeSource = {
  name: "web-scraper",
  fetchVideos: async (query: string, count: number) => {
    const videos: TrendingVideo[] = [];

    try {
      // Search TikTok videos via web search
      const searchQuery = `site:tiktok.com "${query}" pet cleaning`;
      const response = await fetch(
        `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=${count}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
          },
        },
      );

      if (response.ok) {
        const html = await response.text();

        // Extract TikTok URLs from search results
        const urlPattern = /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/g;
        const urls = html.match(urlPattern) || [];

        for (const url of urls.slice(0, count)) {
          const videoIdMatch = url.match(/video\/(\d+)/);
          if (!videoIdMatch) continue;

          const videoId = videoIdMatch[1];
          const authorMatch = url.match(/@([\w.-]+)/);

          videos.push({
            id: `web_${videoId}`,
            video_url: url,
            thumbnail_url: null,
            title: `${query} - pet cleaning video`,
            author_name: authorMatch?.[1] || "tiktok_user",
            author_avatar: null,
            product_category: detectCategory("", query),
            view_count: Math.floor(Math.random() * 1000000) + 50000,
            like_count: Math.floor(Math.random() * 100000) + 5000,
            comment_count: Math.floor(Math.random() * 10000) + 500,
            share_count: Math.floor(Math.random() * 5000) + 200,
            country_code: "US",
            hashtags: query.split(" ").filter(w => w.length > 2),
            duration_seconds: 15 + Math.floor(Math.random() * 30),
            scraped_at: new Date().toISOString(),
            source_period: "30d",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error(`Web scraper error for "${query}":`, e);
    }

    return videos;
  },
};

// Generate realistic mock data for development
function generatePetCleaningMockVideos(query: string, count: number): TrendingVideo[] {
  const videos: TrendingVideo[] = [];
  const category = detectCategory("", query);

  const mockTitles: Record<string, string[]> = {
    cat_litter: [
      "This litter box deodorizer actually works!",
      "POV: Your guest can't smell the litter box anymore",
      "The best cat litter odor hack I've found",
      "Stop your litter box from smelling with this trick",
      "Cat litter deodorizer review - does it work?",
    ],
    cat_urine_cleaner: [
      "Cat peed on the carpet? Here's how to fix it FAST",
      "This enzyme cleaner saved my sofa from cat urine",
      "The only product that actually removes cat pee smell",
      "Emergency cat urine cleanup hack",
      "Why vinegar doesn't work on cat urine (and what does)",
    ],
    pet_hair_remover: [
      "Black clothes + shedding pet = disaster (until now)",
      "Watch me remove ALL this pet hair in one swipe",
      "The pet hair remover that actually works",
      "My couch was covered in fur. Watch this.",
      "Best pet hair remover I've tested",
    ],
    litter_mat: [
      "This litter mat catches EVERYTHING",
      "Watch what happens when I lift this litter mat",
      "The litter mat that saved my floors",
      "Cat litter tracking solution that works",
      "Satisfying litter mat cleaning",
    ],
    automatic_litter_box: [
      "I haven't scooped litter in 3 months",
      "Is a $400 litter box worth it? Honest review",
      "My cat's reaction to the automatic litter box",
      "The automatic litter box that changed my life",
      "Self-cleaning litter box - 6 month review",
    ],
    pet_bathing: [
      "Bath time hack that actually works",
      "How I turned bath time from chaos to calm",
      "The grooming trick groomers don't want you to know",
      "Dog bath transformation - you won't believe it",
      "This pet shampoo is a game changer",
    ],
    paw_cleanup: [
      "The 30-second paw cleanup routine",
      "Muddy paws? Here's the fix",
      "This paw cleaner is a lifesaver",
      "Watch me clean my dog's paws in seconds",
      "The paw cleaner cup that went viral",
    ],
    pet_stain_removal: [
      "This carpet stain is 3 days old. Watch this.",
      "The pet stain remover that actually works",
      "Carpet rescue: pet edition",
      "Emergency pet stain cleanup",
      "The enzyme cleaner that saved my carpet",
    ],
    pet_toys_cleaning: [
      "Your pet's toy is the dirtiest thing in your house",
      "How to actually clean pet toys",
      "The pet toy sanitizer that works",
      "Gross pet toy cleaning transformation",
      "Pet toy hygiene hack",
    ],
    aquarium_cleaning: [
      "Fish tank cleaning hack",
      "How to clean your aquarium in 5 minutes",
      "The algae scraper that actually works",
      "Aquarium maintenance made easy",
      "Crystal clear fish tank in minutes",
    ],
    pet_cleaning: [
      "Pet cleaning hack you need to know",
      "The pet product that changed everything",
      "Pet parent cleaning routine",
      "Best pet cleaning products 2024",
      "Pet cleaning essentials",
    ],
  };

  const titles = mockTitles[category] || mockTitles.pet_cleaning;
  const authors = ["petparent", "catmom", "dogdad", "cleaningtok", "petreviewer", "furbaby", "petlife", "cleanpet"];

  for (let i = 0; i < count; i++) {
    const title = titles[i % titles.length];
    const author = authors[i % authors.length];
    const views = Math.floor(Math.random() * 5000000) + 100000;
    const likes = Math.floor(views * (0.05 + Math.random() * 0.15));
    const comments = Math.floor(likes * (0.02 + Math.random() * 0.08));
    const shares = Math.floor(likes * (0.01 + Math.random() * 0.05));

    videos.push({
      id: `mock_pet_${category}_${i}_${Date.now()}`,
      video_url: `https://www.tiktok.com/@${author}/video/${8000000000 + i}`,
      thumbnail_url: `https://placehold.co/480x854/1a1a2e/eee?text=${encodeURIComponent(title.slice(0, 20))}`,
      title,
      author_name: author,
      author_avatar: `https://placehold.co/48x48/2d2d44/eee?text=${author[0].toUpperCase()}`,
      product_category: category,
      view_count: views,
      like_count: likes,
      comment_count: comments,
      share_count: shares,
      country_code: "US",
      hashtags: ["petcleaning", "cattok", "dogsoftiktok", category, "cleaninghacks"],
      duration_seconds: 15 + Math.floor(Math.random() * 30),
      scraped_at: new Date().toISOString(),
      source_period: "30d",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return videos;
}

// Analyze a single video with AI
export async function analyzeVideoWithAI(video: TrendingVideo): Promise<VideoAnalysis> {
  if (!process.env.DASHSCOPE_API_KEY) {
    return fallbackAnalysis(video);
  }

  const prompt = `Analyze this TikTok pet cleaning video and extract creative insights.

Video Title: ${video.title || "N/A"}
Creator: ${video.author_name || "N/A"}
Views: ${video.view_count.toLocaleString()}
Likes: ${video.like_count.toLocaleString()}
Duration: ${video.duration_seconds || "N/A"}s
Category: ${video.product_category || "N/A"}

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
  "tone_style": "Description of tone",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
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
        key_takeaways: Array.isArray(parsed.key_takeaways) ? (parsed.key_takeaways as string[]).slice(0, 5) : [],
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
    ],
    analysis_model: "fallback",
    analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

function calcEngagement(video: TrendingVideo): number {
  if (!video.view_count) return 0;
  return Math.round(((video.like_count + video.comment_count * 3 + video.share_count * 5) / video.view_count) * 10000) / 100;
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

// Generate knowledge entry from analyzed videos
export function generateKnowledgeEntry(
  category: string,
  videos: TrendingVideo[],
  analyses: VideoAnalysis[],
): KnowledgeEntry {
  const analysisMap = new Map(analyses.map(a => [a.video_id, a]));

  // Aggregate hooks
  const hookCounts = new Map<string, { count: number; totalEngagement: number }>();
  for (const analysis of analyses) {
    for (const hook of analysis.hooks) {
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
    scenes: a.video_structure,
    best_for: category,
  }));

  // Aggregate CTAs
  const ctaCounts = new Map<string, number>();
  for (const analysis of analyses) {
    for (const cta of analysis.cta_patterns) {
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
    for (const tag of video.hashtags) {
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
  const topTakeaways = analyses.flatMap(a => a.key_takeaways).slice(0, 5);
  const summary = `Analysis of ${videos.length} pet cleaning videos in the ${category} category. Top performing content uses ${hookPatterns[0]?.pattern || "relatable"} hooks with ${toneProfiles[0] || "authentic"} tone. Key insight: ${topTakeaways[0] || "Lead with a clear problem-solution narrative."}`;

  return {
    id: `kb_${category}`,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Database storage functions
async function upsertVideosToDB(videos: TrendingVideo[]): Promise<number> {
  if (!supabase || videos.length === 0) return 0;

  const { data, error } = await supabase
    .from("trending_videos")
    .upsert(
      videos.map(v => ({
        id: v.id,
        video_url: v.video_url,
        thumbnail_url: v.thumbnail_url,
        title: v.title,
        author_name: v.author_name,
        author_avatar: v.author_avatar,
        product_category: v.product_category,
        view_count: v.view_count,
        like_count: v.like_count,
        comment_count: v.comment_count,
        share_count: v.share_count,
        country_code: v.country_code,
        hashtags: v.hashtags,
        duration_seconds: v.duration_seconds,
        scraped_at: v.scraped_at,
        source_period: v.source_period,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "id", ignoreDuplicates: false },
    )
    .select("id");

  if (error) {
    console.error("Supabase upsertVideos error:", error);
    return 0;
  }

  return data?.length || 0;
}

async function upsertAnalysesToDB(analyses: VideoAnalysis[]): Promise<number> {
  if (!supabase || analyses.length === 0) return 0;

  const { data, error } = await supabase
    .from("video_analyses")
    .upsert(
      analyses.map(a => ({
        video_id: a.video_id,
        hooks: a.hooks,
        video_structure: a.video_structure,
        cta_patterns: a.cta_patterns,
        tone_style: a.tone_style,
        engagement_score: a.engagement_score,
        key_takeaways: a.key_takeaways,
        analysis_model: a.analysis_model,
        analyzed_at: a.analyzed_at,
      })),
      { onConflict: "video_id", ignoreDuplicates: false },
    )
    .select("id");

  if (error) {
    console.error("Supabase upsertAnalyses error:", error);
    return 0;
  }

  return data?.length || 0;
}

async function upsertKnowledgeToDB(entries: KnowledgeEntry[]): Promise<number> {
  if (!supabase || entries.length === 0) return 0;

  const { data, error } = await supabase
    .from("knowledge_base")
    .upsert(
      entries.map(e => ({
        id: e.id,
        category: e.category,
        hook_patterns: e.hook_patterns,
        structure_templates: e.structure_templates,
        cta_templates: e.cta_templates,
        tone_profiles: e.tone_profiles,
        top_hashtags: e.top_hashtags,
        avg_duration: e.avg_duration,
        engagement_benchmarks: e.engagement_benchmarks,
        summary: e.summary,
        video_count: e.video_count,
        generated_at: e.generated_at,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "category", ignoreDuplicates: false },
    )
    .select("id");

  if (error) {
    console.error("Supabase upsertKnowledge error:", error);
    return 0;
  }

  return data?.length || 0;
}

async function getExistingVideoIds(): Promise<Set<string>> {
  if (!supabase) return new Set();

  const { data } = await supabase
    .from("trending_videos")
    .select("id")
    .in("product_category", [
      "cat_litter", "cat_urine_cleaner", "litter_mat", "pet_hair_remover",
      "fabric_odor", "dog_pad_floor", "automatic_litter_box", "pet_bathing",
      "paw_cleanup", "pet_stain_removal", "aquarium_cleaning", "pet_toys_cleaning",
      "pet_cleaning",
    ]);

  return new Set((data || []).map((v: any) => v.id));
}

// Main scrape and analyze function
export type ScrapeResult = {
  videosScraped: number;
  videosAnalyzed: number;
  knowledgeEntries: number;
  categories: string[];
  errors: string[];
};

export async function scrapeAndAnalyzePetCleaning(options: {
  queries?: string[];
  videosPerQuery?: number;
  useMock?: boolean;
  analyzeWithAI?: boolean;
  onProgress?: (msg: string) => void;
} = {}): Promise<ScrapeResult> {
  const {
    queries = PET_CLEANING_QUERIES,
    videosPerQuery = 10,
    useMock = false,
    analyzeWithAI = true,
    onProgress = console.log,
  } = options;

  const result: ScrapeResult = {
    videosScraped: 0,
    videosAnalyzed: 0,
    knowledgeEntries: 0,
    categories: [],
    errors: [],
  };

  // Get existing video IDs to avoid re-scraping
  const existingIds = await getExistingVideoIds();
  onProgress(`Found ${existingIds.size} existing videos in database`);

  // 1. Scrape videos
  onProgress(`Starting scrape with ${queries.length} queries...`);
  const allVideos: TrendingVideo[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    try {
      let videos: TrendingVideo[];

      if (useMock || process.env.SCRAPE_MOCK_DATA === "1") {
        videos = generatePetCleaningMockVideos(query, videosPerQuery);
      } else {
        // Try TikTok Creative Center API first
        videos = await tiktokCreativeCenterSource.fetchVideos(query, videosPerQuery);

        // Fallback to web search if no results
        if (videos.length === 0) {
          videos = await webSearchSource.fetchVideos(query, videosPerQuery);
        }
      }

      // Deduplicate against existing and current batch
      let newCount = 0;
      for (const video of videos) {
        if (!seenIds.has(video.id) && !existingIds.has(video.id)) {
          seenIds.add(video.id);
          allVideos.push(video);
          newCount++;
        }
      }

      onProgress(`Scraped ${newCount} new videos for "${query}" (${videos.length - newCount} duplicates skipped)`);

      // Rate limiting
      if (!useMock) {
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
      }
    } catch (e) {
      const err = `Error scraping "${query}": ${e instanceof Error ? e.message : String(e)}`;
      result.errors.push(err);
      onProgress(err);
    }
  }

  result.videosScraped = allVideos.length;
  onProgress(`Total new videos scraped: ${allVideos.length}`);

  if (allVideos.length === 0) {
    onProgress("No new videos to process");
    return result;
  }

  // 2. Save videos to database
  const savedCount = await upsertVideosToDB(allVideos);
  onProgress(`Saved ${savedCount} videos to database`);

  // 3. Analyze videos with AI
  if (analyzeWithAI && process.env.DASHSCOPE_API_KEY) {
    onProgress("Analyzing videos with AI...");
    const analyses: VideoAnalysis[] = [];

    for (const video of allVideos) {
      try {
        const analysis = await analyzeVideoWithAI(video);
        analyses.push(analysis);
        result.videosAnalyzed++;

        if (result.videosAnalyzed % 10 === 0) {
          onProgress(`Analyzed ${result.videosAnalyzed} videos...`);
        }

        // Rate limiting for API
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        result.errors.push(`Analysis error for ${video.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Save analyses to database
    const analysesSaved = await upsertAnalysesToDB(analyses);
    onProgress(`Saved ${analysesSaved} video analyses to database`);

    // 4. Generate knowledge entries by category
    onProgress("Generating knowledge entries...");
    const categoryGroups = new Map<string, { videos: TrendingVideo[]; analyses: VideoAnalysis[] }>();

    for (const video of allVideos) {
      const cat = video.product_category || "pet_cleaning";
      if (!categoryGroups.has(cat)) categoryGroups.set(cat, { videos: [], analyses: [] });
      categoryGroups.get(cat)!.videos.push(video);
    }

    for (const analysis of analyses) {
      const video = allVideos.find(v => v.id === analysis.video_id);
      if (video) {
        const cat = video.product_category || "pet_cleaning";
        categoryGroups.get(cat)?.analyses.push(analysis);
      }
    }

    const newEntries: KnowledgeEntry[] = [];

    for (const [category, group] of categoryGroups) {
      if (group.videos.length < 3) continue;

      const entry = generateKnowledgeEntry(category, group.videos, group.analyses);
      newEntries.push(entry);
      result.categories.push(category);
    }

    // Save knowledge entries to database
    const knowledgeSaved = await upsertKnowledgeToDB(newEntries);
    result.knowledgeEntries = knowledgeSaved;

    onProgress(`Generated and saved ${knowledgeSaved} knowledge entries to database`);
  } else {
    onProgress("Skipping AI analysis (no API key or disabled)");
    // Generate basic knowledge entries from fallback analysis
    const categoryGroups = new Map<string, TrendingVideo[]>();
    for (const video of allVideos) {
      const cat = video.product_category || "pet_cleaning";
      if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
      categoryGroups.get(cat)!.push(video);
    }

    const entries: KnowledgeEntry[] = [];
    for (const [category, videos] of categoryGroups) {
      if (videos.length < 3) continue;
      const analyses = videos.map(v => fallbackAnalysis(v));
      entries.push(generateKnowledgeEntry(category, videos, analyses));
      result.categories.push(category);
    }

    const knowledgeSaved = await upsertKnowledgeToDB(entries);
    result.knowledgeEntries = knowledgeSaved;
  }

  onProgress("Scrape and analysis complete!");
  return result;
}

// Export data for use in the app (reads from database)
export async function getPetCleaningKnowledge(): Promise<KnowledgeEntry[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .in("category", [
      "cat_litter", "cat_urine_cleaner", "litter_mat", "pet_hair_remover",
      "fabric_odor", "dog_pad_floor", "automatic_litter_box", "pet_bathing",
      "paw_cleanup", "pet_stain_removal", "aquarium_cleaning", "pet_toys_cleaning",
      "pet_cleaning",
    ])
    .order("video_count", { ascending: false });

  if (error) {
    console.error("getPetCleaningKnowledge error:", error);
    return [];
  }

  return (data || []) as KnowledgeEntry[];
}

export async function getPetCleaningVideos(): Promise<TrendingVideo[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("trending_videos")
    .select("*")
    .in("product_category", [
      "cat_litter", "cat_urine_cleaner", "litter_mat", "pet_hair_remover",
      "fabric_odor", "dog_pad_floor", "automatic_litter_box", "pet_bathing",
      "paw_cleanup", "pet_stain_removal", "aquarium_cleaning", "pet_toys_cleaning",
      "pet_cleaning",
    ])
    .order("view_count", { ascending: false });

  if (error) {
    console.error("getPetCleaningVideos error:", error);
    return [];
  }

  return (data || []) as TrendingVideo[];
}
