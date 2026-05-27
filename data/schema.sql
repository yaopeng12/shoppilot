-- ShopPilot Inspiration Feature — Supabase Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS trending_videos (
  id                TEXT PRIMARY KEY,
  video_url         TEXT NOT NULL,
  thumbnail_url     TEXT,
  title             TEXT,
  author_name       TEXT,
  author_avatar     TEXT,
  product_category  TEXT,
  view_count        BIGINT DEFAULT 0,
  like_count        BIGINT DEFAULT 0,
  comment_count     BIGINT DEFAULT 0,
  share_count       BIGINT DEFAULT 0,
  country_code      TEXT DEFAULT 'US',
  hashtags          TEXT[] DEFAULT '{}',
  duration_seconds  INTEGER,
  scraped_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_period     TEXT,
  raw_data          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trending_videos_category ON trending_videos(product_category);
CREATE INDEX IF NOT EXISTS idx_trending_videos_scraped ON trending_videos(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_videos_views ON trending_videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_trending_videos_likes ON trending_videos(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_trending_videos_country ON trending_videos(country_code);

CREATE TABLE IF NOT EXISTS video_analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id          TEXT NOT NULL REFERENCES trending_videos(id) ON DELETE CASCADE,
  hooks             JSONB NOT NULL,
  video_structure   JSONB NOT NULL,
  cta_patterns      JSONB NOT NULL,
  tone_style        TEXT,
  engagement_score  NUMERIC,
  key_takeaways     TEXT[],
  analysis_model    TEXT DEFAULT 'qwen-plus',
  analyzed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_analysis      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_video_analyses_video_id ON video_analyses(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analyses_analyzed ON video_analyses(analyzed_at DESC);

CREATE TABLE IF NOT EXISTS scrape_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status            TEXT NOT NULL DEFAULT 'running',
  videos_scraped    INTEGER DEFAULT 0,
  videos_analyzed   INTEGER DEFAULT 0,
  error_message     TEXT,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scrape_jobs_started ON scrape_jobs(started_at DESC);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category            TEXT NOT NULL UNIQUE,
  hook_patterns       JSONB NOT NULL DEFAULT '[]',
  structure_templates JSONB NOT NULL DEFAULT '[]',
  cta_templates       JSONB NOT NULL DEFAULT '[]',
  tone_profiles       JSONB[] DEFAULT '{}',
  top_hashtags        TEXT[] DEFAULT '{}',
  avg_duration        INTEGER DEFAULT 0,
  engagement_benchmarks JSONB NOT NULL DEFAULT '[]',
  summary             TEXT,
  video_count         INTEGER DEFAULT 0,
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);

CREATE TABLE IF NOT EXISTS user_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  video_id    TEXT NOT NULL REFERENCES trending_videos(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_video ON user_favorites(video_id);

CREATE TABLE IF NOT EXISTS generations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  product_url TEXT NOT NULL,
  product_title TEXT,
  product_price TEXT,
  product_image TEXT,
  style       TEXT,
  category    TEXT,
  hooks       JSONB,
  scripts     JSONB,
  voiceovers  JSONB,
  subtitles   JSONB,
  hashtags    TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at DESC);
