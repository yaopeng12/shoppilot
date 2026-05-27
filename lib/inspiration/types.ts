import type { TargetMarketCode } from "@/lib/localization/markets";

export type TrendingVideo = {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  author_name: string | null;
  author_avatar: string | null;
  product_category: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  country_code: string;
  hashtags: string[];
  duration_seconds: number | null;
  scraped_at: string;
  source_period: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoScene = {
  time: string;
  description: string;
};

export type VideoAnalysis = {
  id: string;
  video_id: string;
  hooks: string[];
  video_structure: VideoScene[];
  cta_patterns: string[];
  tone_style: string | null;
  engagement_score: number | null;
  key_takeaways: string[];
  analysis_model: string;
  analyzed_at: string;
  created_at: string;
};

export type InspirationFilters = {
  category?: string;
  targetMarket?: TargetMarketCode | string;
  period?: "7d" | "30d";
  sort?: "views" | "likes" | "engagement" | "newest";
  search?: string;
  page?: number;
  pageSize?: number;
};

export type InspirationStats = {
  totalVideos: number;
  totalAnalyses: number;
  categoryCounts: Record<string, number>;
  latestScrape: string | null;
  avgEngagement: number;
};

export type ScrapeJob = {
  id: string;
  status: "running" | "completed" | "failed";
  videos_scraped: number;
  videos_analyzed: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
};

export type KnowledgeEntry = {
  id: string;
  category: string;
  hook_patterns: { pattern: string; example: string; frequency: number; avg_engagement: number }[];
  structure_templates: { name: string; scenes: { time: string; description: string }[]; best_for: string }[];
  cta_templates: string[];
  tone_profiles: string[];
  top_hashtags: string[];
  avg_duration: number;
  engagement_benchmarks: { metric: string; value: number }[];
  summary: string;
  video_count: number;
  generated_at: string;
  created_at: string;
  updated_at: string;
};

export const CATEGORIES = [
  "automatic_litter_box",
  "cat_litter",
  "litter_mat",
  "cat_urine_cleaner",
  "pet_hair_remover",
  "fabric_odor_control",
  "dog_pad_cleanup",
] as const;

export type Category = (typeof CATEGORIES)[number];
