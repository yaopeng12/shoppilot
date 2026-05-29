-- ShopPilot pet-cleaning vertical schema upgrade
-- Run in Supabase SQL Editor after confirming the target project.
-- This migration is idempotent where possible and keeps existing data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- App users currently live in data/users.json. Move them into Supabase before production.
CREATE TABLE IF NOT EXISTS profiles (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL,
  name           TEXT,
  image          TEXT,
  plan           TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  api_key_hash   TEXT,
  api_key_last4  TEXT,
  password_hash  TEXT,
  email_verified_at TIMESTAMPTZ,
  verification_code_hash TEXT,
  verification_code_expires_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_code_hash TEXT,
  ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified_at);

CREATE TABLE IF NOT EXISTS daily_usage (
  user_id          TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  usage_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage(usage_date DESC);

-- Raw/curated candidate observations from public ad research.
CREATE TABLE IF NOT EXISTS template_candidates (
  source_id          TEXT PRIMARY KEY,
  platform           TEXT NOT NULL DEFAULT 'tiktok',
  source_url         TEXT,
  target_market      TEXT NOT NULL DEFAULT 'en-US',
  product_category   TEXT,
  pet_context        TEXT,
  pain_point         TEXT,
  use_scene          TEXT,
  hook_type          TEXT,
  first_three_seconds TEXT,
  owner_emotion      TEXT,
  pet_behavior       TEXT,
  proof_type         TEXT,
  shot_sequence      JSONB NOT NULL DEFAULT '[]',
  caption_pattern    JSONB NOT NULL DEFAULT '[]',
  cta_type           TEXT,
  comment_insights   JSONB NOT NULL DEFAULT '[]',
  compliance_risks   JSONB NOT NULL DEFAULT '[]',
  originality_notes  TEXT,
  public_metrics     JSONB NOT NULL DEFAULT '{}',
  score              NUMERIC,
  status             TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'approved', 'rejected')),
  collected_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload        JSONB NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_template_candidates_source_url ON template_candidates(source_url) WHERE source_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_template_candidates_market ON template_candidates(target_market);
CREATE INDEX IF NOT EXISTS idx_template_candidates_category ON template_candidates(product_category);
CREATE INDEX IF NOT EXISTS idx_template_candidates_pain_point ON template_candidates(pain_point);
CREATE INDEX IF NOT EXISTS idx_template_candidates_score ON template_candidates(score DESC);
CREATE INDEX IF NOT EXISTS idx_template_candidates_status ON template_candidates(status);

-- Approved reusable templates. These should be original structures, not copied creator content.
CREATE TABLE IF NOT EXISTS creative_templates (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key           TEXT NOT NULL,
  target_market          TEXT NOT NULL DEFAULT 'en-US',
  name                   TEXT NOT NULL,
  product_category       TEXT,
  pain_point             TEXT,
  use_scene              TEXT,
  structure              JSONB NOT NULL DEFAULT '[]',
  hook_patterns          JSONB NOT NULL DEFAULT '[]',
  cta_templates          JSONB NOT NULL DEFAULT '[]',
  tone_profiles          JSONB NOT NULL DEFAULT '[]',
  compliance_guardrails  JSONB NOT NULL DEFAULT '[]',
  evidence_candidate_ids TEXT[] NOT NULL DEFAULT '{}',
  confidence_score       NUMERIC NOT NULL DEFAULT 0,
  status                 TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_key, target_market)
);

CREATE INDEX IF NOT EXISTS idx_creative_templates_market ON creative_templates(target_market);
CREATE INDEX IF NOT EXISTS idx_creative_templates_category ON creative_templates(product_category);
CREATE INDEX IF NOT EXISTS idx_creative_templates_pain_point ON creative_templates(pain_point);
CREATE INDEX IF NOT EXISTS idx_creative_templates_status ON creative_templates(status);

-- Existing inspiration tables: add localization/research dimensions.
ALTER TABLE trending_videos
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'tiktok',
  ADD COLUMN IF NOT EXISTS target_market TEXT DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS pain_point TEXT,
  ADD COLUMN IF NOT EXISTS use_scene TEXT;

CREATE INDEX IF NOT EXISTS idx_trending_videos_market ON trending_videos(target_market);
CREATE INDEX IF NOT EXISTS idx_trending_videos_pain_point ON trending_videos(pain_point);

ALTER TABLE video_analyses
  ADD COLUMN IF NOT EXISTS target_market TEXT DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS localization_notes JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_video_analyses_market ON video_analyses(target_market);

ALTER TABLE scrape_jobs
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS target_market TEXT,
  ADD COLUMN IF NOT EXISTS target_count INTEGER,
  ADD COLUMN IF NOT EXISTS result_payload JSONB NOT NULL DEFAULT '{}';

-- knowledge_base currently has category as globally unique and tone_profiles as JSONB[].
-- Make it market-aware and align tone_profiles with the app's string-array JSON usage.
ALTER TABLE knowledge_base
  ADD COLUMN IF NOT EXISTS target_market TEXT NOT NULL DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS localization_notes JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source_candidate_ids TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE knowledge_base
  ALTER COLUMN tone_profiles TYPE JSONB
  USING to_jsonb(tone_profiles),
  ALTER COLUMN tone_profiles SET DEFAULT '[]',
  ALTER COLUMN tone_profiles SET NOT NULL;

ALTER TABLE knowledge_base
  DROP CONSTRAINT IF EXISTS knowledge_base_category_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_base_category_market ON knowledge_base(category, target_market);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_market ON knowledge_base(target_market);

-- User-owned actions should reference profiles once user data moves out of JSON.
ALTER TABLE user_favorites
  ADD COLUMN IF NOT EXISTS created_from TEXT DEFAULT 'app';

-- Full generation history for dashboard and future exports.
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS generation_type TEXT NOT NULL DEFAULT 'pet_ad_pack',
  ADD COLUMN IF NOT EXISTS target_market TEXT,
  ADD COLUMN IF NOT EXISTS user_note TEXT,
  ADD COLUMN IF NOT EXISTS selected_template_id UUID REFERENCES creative_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS selected_template_key TEXT,
  ADD COLUMN IF NOT EXISTS selected_source JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS result_payload JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_generations_type ON generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_generations_market ON generations(target_market);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
