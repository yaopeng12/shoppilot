import { supabase } from "./supabase";
import type { TrendingVideo, VideoAnalysis, InspirationFilters, InspirationStats, KnowledgeEntry } from "./types";

export async function upsertVideos(videos: TrendingVideo[]): Promise<number> {
  if (!supabase || videos.length === 0) return 0;

  const { data, error } = await supabase
    .from("trending_videos")
    .upsert(
      videos.map((v) => ({
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

export async function upsertAnalyses(analyses: VideoAnalysis[]): Promise<number> {
  if (!supabase || analyses.length === 0) return 0;

  const { data, error } = await supabase
    .from("video_analyses")
    .upsert(
      analyses.map((a) => ({
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

export async function getVideos(filters: InspirationFilters = {}) {
  if (!supabase) return { videos: [], total: 0 };

  const {
    category,
    period,
    sort = "views",
    search,
    page = 1,
    pageSize = 20,
  } = filters;

  let query = supabase
    .from("trending_videos")
    .select("*, video_analyses(*)", { count: "exact" });

  if (category) {
    query = query.eq("product_category", category);
  }

  if (period === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    query = query.gte("scraped_at", d.toISOString());
  } else if (period === "30d") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    query = query.gte("scraped_at", d.toISOString());
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,author_name.ilike.%${search}%`);
  }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    views: { column: "view_count", ascending: false },
    likes: { column: "like_count", ascending: false },
    engagement: { column: "view_count", ascending: false }, // fallback, sorted in-memory if needed
    newest: { column: "scraped_at", ascending: false },
  };

  const sortConfig = sortMap[sort] || sortMap.views;
  query = query.order(sortConfig.column, { ascending: sortConfig.ascending });

  const offset = (page - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase getVideos error:", error);
    return { videos: [], total: 0 };
  }

  return {
    videos: (data || []) as unknown as (TrendingVideo & { video_analyses: VideoAnalysis[] })[],
    total: count || 0,
  };
}

export async function getVideoById(id: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("trending_videos")
    .select("*, video_analyses(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase getVideoById error:", error);
    return null;
  }

  return data as unknown as TrendingVideo & { video_analyses: VideoAnalysis[] };
}

export async function getStats(): Promise<InspirationStats> {
  if (!supabase) {
    return { totalVideos: 0, totalAnalyses: 0, categoryCounts: {}, latestScrape: null, avgEngagement: 0 };
  }

  const [videosRes, analysesRes, categoriesRes, latestRes] = await Promise.all([
    supabase.from("trending_videos").select("id", { count: "exact", head: true }),
    supabase.from("video_analyses").select("id", { count: "exact", head: true }),
    supabase.from("trending_videos").select("product_category"),
    supabase.from("trending_videos").select("scraped_at").order("scraped_at", { ascending: false }).limit(1),
    supabase.from("video_analyses").select("engagement_score"),
  ]);

  const categoryCounts: Record<string, number> = {};
  if (categoriesRes.data) {
    for (const row of categoriesRes.data) {
      const cat = (row as { product_category: string }).product_category || "Unknown";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }

  let avgEngagement = 0;
  if (analysesRes.data) {
    const scores = (analysesRes.data as unknown as { engagement_score: number | null }[])
      .map((r) => r.engagement_score)
      .filter((s): s is number => s !== null);
    if (scores.length > 0) {
      avgEngagement = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
    }
  }

  return {
    totalVideos: videosRes.count || 0,
    totalAnalyses: analysesRes.count || 0,
    categoryCounts,
    latestScrape: latestRes.data?.[0]
      ? (latestRes.data[0] as { scraped_at: string }).scraped_at
      : null,
    avgEngagement,
  };
}

export async function createScrapeJob() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("scrape_jobs")
    .insert({ status: "running" })
    .select("id")
    .single();
  if (error) return null;
  return (data as { id: string }).id;
}

export async function updateScrapeJob(
  jobId: string,
  updates: { status?: string; videos_scraped?: number; videos_analyzed?: number; error_message?: string },
) {
  if (!supabase) return;
  const payload: Record<string, unknown> = { ...updates };
  if (updates.status === "completed" || updates.status === "failed") {
    payload.completed_at = new Date().toISOString();
  }
  await supabase.from("scrape_jobs").update(payload).eq("id", jobId);
}

export async function getKnowledgeBase(): Promise<KnowledgeEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .order("video_count", { ascending: false });
  if (error) {
    console.error("Supabase getKnowledgeBase error:", error);
    return [];
  }
  return (data || []) as KnowledgeEntry[];
}

export async function getKnowledgeByCategory(category: string): Promise<KnowledgeEntry | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("category", category)
    .single();
  if (error) return null;
  return data as KnowledgeEntry;
}

export async function toggleFavorite(userId: string, videoId: string): Promise<{ favorited: boolean }> {
  if (!supabase) return { favorited: false };

  const { data: existing } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();

  if (existing) {
    await supabase.from("user_favorites").delete().eq("id", (existing as { id: string }).id);
    return { favorited: false };
  }

  await supabase.from("user_favorites").insert({ user_id: userId, video_id: videoId });
  return { favorited: true };
}

export async function getUserFavorites(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_favorites")
    .select("video_id, created_at, trending_videos(*, video_analyses(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export async function isFavorited(userId: string, videoId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();
  return !!data;
}

export type GenerationRecord = {
  id: string;
  user_id: string;
  product_url: string;
  product_title: string | null;
  product_price: string | null;
  product_image: string | null;
  style: string | null;
  category: string | null;
  hooks: string[];
  scripts: unknown[];
  voiceovers: string[];
  subtitles: unknown[];
  hashtags: string[];
  created_at: string;
};

export async function saveGeneration(userId: string, data: {
  productUrl: string;
  productTitle?: string;
  productPrice?: string;
  productImage?: string;
  style?: string;
  category?: string | null;
  hooks: string[];
  scripts: unknown[];
  voiceovers: string[];
  subtitles: unknown[];
  hashtags?: string[];
}) {
  if (!supabase) return;
  await supabase.from("generations").insert({
    user_id: userId,
    product_url: data.productUrl,
    product_title: data.productTitle || null,
    product_price: data.productPrice || null,
    product_image: data.productImage || null,
    style: data.style || null,
    category: data.category || null,
    hooks: data.hooks,
    scripts: data.scripts,
    voiceovers: data.voiceovers,
    subtitles: data.subtitles,
    hashtags: data.hashtags || [],
  });
}

export async function getUserGenerations(userId: string, limit = 20): Promise<GenerationRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data || []) as GenerationRecord[];
}
