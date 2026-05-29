import { supabase } from "./supabase";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import {
  getLocalizedCategoryLabel,
  getLocalizedTemplateSignal,
  getMarketProfile,
  normalizeTargetMarket,
  type MarketProfile,
} from "@/lib/localization/markets";
import { CATEGORIES, type TrendingVideo, type VideoAnalysis, type InspirationFilters, type InspirationStats, type KnowledgeEntry } from "./types";
import { inferVideoMarketPlaybook } from "./market-intelligence";

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

function attachMarketPlaybook<T extends TrendingVideo & { video_analyses?: VideoAnalysis[] }>(
  video: T,
  targetMarket?: string,
): T {
  const playbook = inferVideoMarketPlaybook(video, targetMarket);
  const analyses = Array.isArray(video.video_analyses)
    ? video.video_analyses.map((analysis) => ({ ...analysis, market_playbook: analysis.market_playbook || playbook }))
    : video.video_analyses;

  return {
    ...video,
    market_playbook: video.market_playbook || playbook,
    video_analyses: analyses,
  };
}

export async function getVideos(filters: InspirationFilters = {}) {
  if (!supabase) return getLocalVideos(filters);

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

  query = query.in("product_category", [...CATEGORIES]);

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
    return getLocalVideos(filters);
  }

  const result = {
    videos: ((data || []) as unknown as (TrendingVideo & { video_analyses: VideoAnalysis[] })[]).map((video) =>
      attachMarketPlaybook(video, filters.targetMarket),
    ),
    total: count || 0,
  };

  return result.total > 0 ? result : getLocalVideos(filters);
}

export async function getVideoById(id: string) {
  if (!supabase) {
    return getLocalVideos({ pageSize: 500 }).videos.find((video) => video.id === id) || null;
  }

  const { data, error } = await supabase
    .from("trending_videos")
    .select("*, video_analyses(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase getVideoById error:", error);
    return getLocalVideos({ pageSize: 500 }).videos.find((video) => video.id === id) || null;
  }

  const fallback = getLocalVideos({ pageSize: 500 }).videos.find((video) => video.id === id) || null;
  return data ? attachMarketPlaybook(data as unknown as TrendingVideo & { video_analyses: VideoAnalysis[] }) : fallback;
}

export async function getStats(): Promise<InspirationStats> {
  if (!supabase) return getLocalStats();
  const petCategories = [...CATEGORIES];

  const [videosRes, analysesRes, categoriesRes, latestRes, engagementRes] = await Promise.all([
    supabase.from("trending_videos").select("id", { count: "exact", head: true }).in("product_category", petCategories),
    supabase
      .from("video_analyses")
      .select("id, trending_videos!inner(product_category)", { count: "exact", head: true })
      .in("trending_videos.product_category", petCategories),
    supabase.from("trending_videos").select("product_category").in("product_category", petCategories),
    supabase.from("trending_videos").select("scraped_at").in("product_category", petCategories).order("scraped_at", { ascending: false }).limit(1),
    supabase
      .from("video_analyses")
      .select("engagement_score, trending_videos!inner(product_category)")
      .in("trending_videos.product_category", petCategories),
  ]);

  if (videosRes.error || analysesRes.error || categoriesRes.error || latestRes.error || engagementRes.error) {
    console.error("Supabase getStats error:", {
      videos: videosRes.error,
      analyses: analysesRes.error,
      categories: categoriesRes.error,
      latest: latestRes.error,
      engagement: engagementRes.error,
    });
    return getLocalStats();
  }

  const categoryCounts: Record<string, number> = {};
  if (categoriesRes.data) {
    for (const row of categoriesRes.data) {
      const cat = (row as { product_category: string }).product_category || "Unknown";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }

  let avgEngagement = 0;
  if (engagementRes.data) {
    const scores = (engagementRes.data as unknown as { engagement_score: number | null }[])
      .map((r) => r.engagement_score)
      .filter((s): s is number => s !== null);
    if (scores.length > 0) {
      avgEngagement = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
    }
  }

  const stats = {
    totalVideos: videosRes.count || 0,
    totalAnalyses: analysesRes.count || 0,
    categoryCounts,
    latestScrape: latestRes.data?.[0]
      ? (latestRes.data[0] as { scraped_at: string }).scraped_at
      : null,
    avgEngagement,
  };

  return stats.totalVideos > 0 ? stats : getLocalStats();
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

type LocalTemplateCandidate = {
  source_id?: string;
  product_category?: string;
  pain_point?: string;
  url?: string;
  hook_type?: string;
  first_three_seconds?: string;
  owner_emotion?: string;
  proof_type?: string;
  use_scene?: string;
  cta_type?: string;
  caption_pattern?: string[];
  compliance_risks?: string[];
  comment_insights?: string[];
  originality_notes?: string;
  public_metrics?: { likes?: number; comments?: number; shares?: number };
  score?: number;
  collected_at?: string;
};

const LOCAL_RESEARCH_DIR = path.join(process.cwd(), "data", "pet-template-research");
const KNOWLEDGE_SEED_FILE = path.join(process.cwd(), "data", "knowledge-seed.json");

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readLocalTemplateCandidates(): LocalTemplateCandidate[] {
  try {
    if (!existsSync(LOCAL_RESEARCH_DIR)) return [];
    const files = readdirSync(LOCAL_RESEARCH_DIR).filter((file) => file.endsWith("-candidate-scored.jsonl"));

    return files.flatMap((file: string) => {
      const content = readFileSync(path.join(LOCAL_RESEARCH_DIR, file), "utf-8");
      return content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line) as LocalTemplateCandidate;
          } catch {
            return null;
          }
        })
        .filter((candidate): candidate is LocalTemplateCandidate => Boolean(candidate));
    });
  } catch {
    return [];
  }
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildCandidateStructure(painPoint: string, group: LocalTemplateCandidate[], targetMarket?: string) {
  const primary = group[0];
  const signal = getLocalizedTemplateSignal(
    {
      painPoint,
      productCategory: primary.product_category,
      useScene: primary.use_scene,
    },
    targetMarket,
  );

  return {
    name: `${humanize(painPoint)} candidate structure`,
    scenes: [
      {
        time: "0-3s",
        description: signal.opener,
      },
      {
        time: "3-8s",
        description: signal.secondaryHook,
      },
      {
        time: "8-16s",
        description: signal.proofLine,
      },
      {
        time: "16-24s",
        description: signal.cta,
      },
    ],
    best_for: Array.from(new Set(group.map((candidate) => candidate.product_category).filter(Boolean))).join(", "),
  };
}

function buildKnowledgeEntry(
  id: string,
  category: string,
  candidates: LocalTemplateCandidate[],
  generatedAt: string,
  targetMarket?: string,
): KnowledgeEntry {
  const market = getMarketProfile(targetMarket);
  const hookCounts = countBy(candidates.map((candidate) => candidate.hook_type || "unknown"));
  const ctaTypes = Array.from(new Set(candidates.map((candidate) => candidate.cta_type).filter(Boolean))) as string[];
  const tones = Array.from(new Set(candidates.map((candidate) => candidate.owner_emotion).filter(Boolean))) as string[];
  const hashtags = Array.from(
    new Set(
      candidates
        .flatMap((candidate) => [candidate.product_category, candidate.pain_point, candidate.use_scene])
        .filter((value): value is string => Boolean(value))
        .map((value) => value.replace(/[^a-z0-9_]/gi, "").replace(/_/g, "")),
    ),
  ).slice(0, 12);
  const structuresByPainPoint = Object.entries(
    candidates.reduce<Record<string, LocalTemplateCandidate[]>>((acc, candidate) => {
      const key = candidate.pain_point || "pet_cleaning";
      acc[key] = acc[key] || [];
      acc[key].push(candidate);
      return acc;
    }, {}),
  );
  const totalScore = candidates.reduce((sum, candidate) => sum + (candidate.score || 0), 0);
  const avgScore = Math.round(totalScore / Math.max(1, candidates.length));
  const maxLikes = Math.max(...candidates.map((candidate) => candidate.public_metrics?.likes || 0));
  const maxShares = Math.max(...candidates.map((candidate) => candidate.public_metrics?.shares || 0));

  const entry: KnowledgeEntry = {
    id,
    category,
    hook_patterns: Object.entries(hookCounts).map(([pattern, frequency]) => {
      const sample = candidates.find((candidate) => candidate.hook_type === pattern) || candidates[0];
      const signal = getLocalizedTemplateSignal(
        {
          painPoint: sample?.pain_point,
          productCategory: sample?.product_category,
          useScene: sample?.use_scene,
        },
        targetMarket,
      );
      const matching = candidates.filter((candidate) => candidate.hook_type === pattern);
      const avgEngagement = Math.round(
        matching.reduce((sum, candidate) => sum + (candidate.score || 0), 0) / Math.max(1, matching.length),
      );

      return {
        pattern: humanize(pattern),
        example: signal.opener,
        frequency,
        avg_engagement: avgEngagement,
      };
    }),
    structure_templates: structuresByPainPoint.map(([painPoint, group]) => buildCandidateStructure(painPoint, group, targetMarket)),
    cta_templates: uniqueStrings(
      ctaTypes.map((ctaType) => {
        const sample = candidates.find((candidate) => candidate.cta_type === ctaType) || candidates[0];
        return getLocalizedTemplateSignal(
          {
            painPoint: sample?.pain_point,
            productCategory: sample?.product_category,
            useScene: sample?.use_scene,
          },
          targetMarket,
        ).cta;
      }),
    ),
    tone_profiles: uniqueStrings([market.localizationLevel, market.tone, ...tones.map(humanize)]),
    top_hashtags: uniqueStrings(hashtags),
    avg_duration: 24,
    engagement_benchmarks: [
      { metric: "candidate_score_avg", value: avgScore },
      { metric: "max_public_likes", value: maxLikes },
      { metric: "max_public_shares", value: maxShares },
    ],
    summary:
      "Local candidate research comes from public TikTok Creative Center metadata; reuse the structure and local speaking style, not creator assets or exact wording.",
    video_count: candidates.length,
    generated_at: generatedAt,
    created_at: generatedAt,
    updated_at: generatedAt,
  };

  return localizeKnowledgeEntry(entry, targetMarket);
}

function readKnowledgeSeed(): KnowledgeEntry[] {
  try {
    // Read seed data from file (for initial setup)
    if (!existsSync(KNOWLEDGE_SEED_FILE)) return [];
    return JSON.parse(readFileSync(KNOWLEDGE_SEED_FILE, "utf-8")) as KnowledgeEntry[];
  } catch {
    return [];
  }
}

function buildLocalKnowledgeBase(targetMarket?: string): KnowledgeEntry[] {
  const candidates = readLocalTemplateCandidates();
  const seedEntries = readKnowledgeSeed();

  // If no candidates from research, use seed data
  if (candidates.length === 0 && seedEntries.length > 0) {
    return localizeKnowledgeEntries(seedEntries, targetMarket);
  }

  if (candidates.length === 0) return [];

  const generatedAt = candidates
    .map((candidate) => candidate.collected_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) || new Date().toISOString();

  const researchEntries = Object.entries(
    candidates.reduce<Record<string, LocalTemplateCandidate[]>>((acc, candidate) => {
      const painPoint = candidate.pain_point || "pet_cleaning";
      const productCategory = candidate.product_category || "pet_cleaning";
      const key = `${painPoint}__${productCategory}`;
      acc[key] = acc[key] || [];
      acc[key].push(candidate);
      return acc;
    }, {}),
  )
    .map(([key, group]) => {
      const [painPoint, productCategory] = key.split("__");
      return buildKnowledgeEntry(
        `local_${painPoint}_${productCategory}`,
        getLocalizedCategoryLabel({ painPoint, productCategory }, targetMarket),
        group,
        generatedAt,
        targetMarket,
      );
    });

  // Merge seed entries that don't overlap with research entries
  const researchCategories = new Set(researchEntries.map(e => e.category));
  const uniqueSeedEntries = seedEntries.filter(e => !researchCategories.has(e.category));

  return [...researchEntries, ...localizeKnowledgeEntries(uniqueSeedEntries, targetMarket)]
    .sort((a, b) => b.video_count - a.video_count || b.engagement_benchmarks[0].value - a.engagement_benchmarks[0].value);
}

function localizeKnowledgeEntries(entries: KnowledgeEntry[], targetMarket?: string): KnowledgeEntry[] {
  return entries.map((entry) => localizeKnowledgeEntry(entry, targetMarket));
}

function localizeKnowledgeEntry(entry: KnowledgeEntry, targetMarket?: string): KnowledgeEntry {
  const market = getMarketProfile(normalizeTargetMarket(targetMarket));
  const signal = getLocalizedTemplateSignal({ painPoint: entry.category, productCategory: entry.category }, market.code);
  const hookExamples = uniqueStrings([
    signal.opener,
    signal.secondaryHook,
    signal.productReveal,
    signal.proofLine,
    signal.cta,
    ...signal.captions,
  ]);
  const sceneDescriptions = [signal.opener, signal.secondaryHook, signal.productReveal, signal.proofLine, signal.cta];
  const baseSummary = stripMarketSummary(entry.summary);

  return {
    ...entry,
    id: `${stripMarketSuffix(entry.id)}_${market.code}`,
    category: `${stripMarketCategory(entry.category)} · ${market.label}`,
    hook_patterns: entry.hook_patterns.map((hook, index) => ({
      ...hook,
      example: hookExamples[index % hookExamples.length] || hook.example,
    })),
    structure_templates: entry.structure_templates.map((template) => ({
      ...template,
      name: `${stripMarketTemplateName(template.name)} · ${market.label}`,
      best_for: `${stripMarketBestFor(template.best_for)} · ${market.targetMarket}`,
      scenes: template.scenes.map((scene, index) => ({
        ...scene,
        description: sceneDescriptions[index % sceneDescriptions.length] || scene.description,
      })),
    })),
    cta_templates: uniqueStrings([signal.cta, ...signal.captions.slice(0, 3), ...entry.cta_templates]).slice(0, 8),
    tone_profiles: uniqueStrings([
      market.targetMarket,
      market.localizationLevel,
      market.tone,
      market.creatorVoiceReference,
      ...entry.tone_profiles,
    ]).slice(0, 8),
    top_hashtags: buildMarketHashtags(entry.top_hashtags, signal.hashtags, market),
    summary: `${market.targetMarket} market playbook: ${market.creatorVoiceReference}. ${baseSummary}`,
  };
}

function stripMarketSuffix(id: string): string {
  return id.replace(/_(en-US|en-GB|th|id|vi|ms|ja|es|pt-BR)$/u, "");
}

function stripMarketCategory(category: string): string {
  return category.split(" · ")[0].trim();
}

function stripMarketTemplateName(name: string): string {
  return name.split(" · ")[0].trim();
}

function stripMarketBestFor(bestFor: string): string {
  return bestFor.split(" · ")[0].trim();
}

function stripMarketSummary(summary: string): string {
  return summary
    .replace(/^Localized for [^:]+:\s*[^.]+\.\s*/u, "")
    .replace(/^[^:]+ market playbook:\s*[^.]+\.\s*/u, "")
    .trim();
}

function buildMarketHashtags(baseTags: string[], signalTags: string[], market: MarketProfile): string[] {
  const marketTags: Record<MarketProfile["code"], string[]> = {
    "en-US": ["PetTok", "CleanTok", "TikTokMadeMeBuyIt", "PetParent"],
    "en-GB": ["PetTokUK", "CleanTokUK", "FlatFriendly", "PetCareUK"],
    th: ["PetTokTH", "TikTokThailand", "PetHomeTH", "CleanHomeTH"],
    id: ["PetTokID", "TikTokIndonesia", "RumahBersih", "PetCareID"],
    vi: ["PetTokVN", "TikTokVietnam", "NhaSach", "MeoVatThuCung"],
    ms: ["PetTokMY", "TikTokMalaysia", "RumahBersih", "PetCareMY"],
    ja: ["PetTokJP", "TikTokJapan", "PetRoutine", "CleanHomeJP"],
    es: ["PetTokLATAM", "TikTokMexico", "CasaLimpia", "Mascotas"],
    "pt-BR": ["PetTokBR", "TikTokBrasil", "CasaLimpa", "PetsBrasil"],
  };

  return uniqueStrings([...marketTags[market.code], ...signalTags, ...baseTags])
    .map((tag) => tag.replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 12);
}

function candidateToVideo(candidate: LocalTemplateCandidate, targetMarket?: string): TrendingVideo & { video_analyses: VideoAnalysis[] } {
  const id = candidate.source_id || `local_${Math.random().toString(36).slice(2)}`;
  const collectedAt = candidate.collected_at || new Date().toISOString();
  const hookType = candidate.hook_type || "routine_upgrade";
  const painPoint = candidate.pain_point || "pet_cleaning";
  const productCategory = candidate.product_category || "pet_cleaning";
  const useScene = candidate.use_scene || "pet_home";
  const proofType = candidate.proof_type || "practical_demo";
  const likes = candidate.public_metrics?.likes || 0;
  const comments = candidate.public_metrics?.comments || 0;
  const shares = candidate.public_metrics?.shares || 0;
  const market = getMarketProfile(targetMarket);
  const signal = getLocalizedTemplateSignal(
    {
      painPoint,
      productCategory,
      useScene,
    },
    market.code,
  );
  const baseVideo: TrendingVideo = {
    id,
    video_url: candidate.source_id ? candidate.url || "" : "",
    thumbnail_url: null,
    title: getLocalizedCategoryLabel({ painPoint, productCategory }, market.code),
    author_name: "TikTok Creative Center",
    author_avatar: null,
    product_category: productCategory,
    view_count: 0,
    like_count: likes,
    comment_count: comments,
    share_count: shares,
    country_code: market.code === "en-US" ? "US" : market.code === "en-GB" ? "GB" : market.code.toUpperCase(),
    hashtags: [productCategory, painPoint, useScene, ...signal.hashtags].map((value) => value.replace(/^#/, "").replace(/[^a-z0-9_]/gi, "")),
    duration_seconds: 24,
    scraped_at: collectedAt,
    source_period: "candidate_research",
    created_at: collectedAt,
    updated_at: collectedAt,
  };
  const playbook = inferVideoMarketPlaybook(baseVideo, market.code);

  return {
    ...baseVideo,
    market_playbook: playbook,
    video_analyses: [
      {
        id: `${id}_analysis`,
        video_id: id,
        hooks: [
          signal.opener,
          signal.secondaryHook,
          humanize(hookType),
          ...(candidate.caption_pattern || []).slice(0, 2),
        ],
        video_structure: [
          {
            time: "0-3s",
            description: signal.opener,
          },
          {
            time: "3-8s",
            description: signal.secondaryHook,
          },
          {
            time: "8-16s",
            description: signal.proofLine,
          },
          {
            time: "16-24s",
            description: signal.cta,
          },
        ],
        cta_patterns: [signal.cta],
        tone_style: [market.targetMarket, signal.tone, candidate.owner_emotion && humanize(candidate.owner_emotion), proofType && `Proof: ${humanize(proofType)}`]
          .filter(Boolean)
          .join(" / "),
        engagement_score: candidate.score || null,
        key_takeaways: [
          `Best market: ${playbook.primaryMarketLabel} (${playbook.confidence} confidence).`,
          `Market tactic: ${playbook.hookAngle}`,
          signal.culturalNote,
          ...(candidate.comment_insights || []),
          ...(candidate.compliance_risks || []).map((risk) => `Compliance watchout: ${humanize(risk)}`),
          candidate.originality_notes || "Use this as structural inspiration only; do not copy creator wording or assets.",
        ].filter(Boolean),
        market_playbook: playbook,
        analysis_model: "local_candidate_research",
        analyzed_at: collectedAt,
        created_at: collectedAt,
      },
    ],
  };
}

function getLocalVideos(filters: InspirationFilters = {}) {
  const targetMarket = normalizeTargetMarket(filters.targetMarket);
  let videos = readLocalTemplateCandidates().map((candidate) => candidateToVideo(candidate, targetMarket));

  if (filters.category) {
    videos = videos.filter((video) => video.product_category === filters.category);
  }

  if (filters.period === "7d" || filters.period === "30d") {
    const days = filters.period === "7d" ? 7 : 30;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    videos = videos.filter((video) => new Date(video.scraped_at).getTime() >= since);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    videos = videos.filter((video) => {
      const analysis = video.video_analyses[0];
      return [
        video.title,
        video.product_category,
        video.author_name,
        ...video.hashtags,
        ...(analysis?.hooks || []),
        ...(analysis?.key_takeaways || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }

  const sort = filters.sort || "views";
  videos = [...videos].sort((a, b) => {
    if (sort === "likes") return b.like_count - a.like_count;
    if (sort === "newest") return b.scraped_at.localeCompare(a.scraped_at);
    if (sort === "engagement") {
      const aScore = a.video_analyses[0]?.engagement_score || 0;
      const bScore = b.video_analyses[0]?.engagement_score || 0;
      return bScore - aScore;
    }
    return b.like_count + b.share_count + b.comment_count - (a.like_count + a.share_count + a.comment_count);
  });

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const total = videos.length;
  const offset = (page - 1) * pageSize;

  return {
    videos: videos.slice(offset, offset + pageSize),
    total,
  };
}

function getLocalStats(): InspirationStats {
  const videos = readLocalTemplateCandidates().map((candidate) => candidateToVideo(candidate));
  const categoryCounts = videos.reduce<Record<string, number>>((acc, video) => {
    const category = video.product_category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const scores = videos
    .map((video) => video.video_analyses[0]?.engagement_score)
    .filter((score): score is number => typeof score === "number");

  return {
    totalVideos: videos.length,
    totalAnalyses: videos.length,
    categoryCounts,
    latestScrape: videos.map((video) => video.scraped_at).sort().at(-1) || null,
    avgEngagement: scores.length ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100 : 0,
  };
}

export async function getKnowledgeBase(targetMarket?: string): Promise<KnowledgeEntry[]> {
  if (!supabase) return buildLocalKnowledgeBase(targetMarket);
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .order("video_count", { ascending: false });
  if (error) {
    console.error("Supabase getKnowledgeBase error:", error);
    return buildLocalKnowledgeBase(targetMarket);
  }

  const entries = (data || []) as KnowledgeEntry[];
  return entries.length > 0 ? localizeKnowledgeEntries(entries, targetMarket) : buildLocalKnowledgeBase(targetMarket);
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

type LocalGenerationsDB = {
  generations: GenerationRecord[];
};

const LOCAL_GENERATIONS_FILE = path.join(process.cwd(), "data", "generations.json");

function readLocalGenerations(): LocalGenerationsDB {
  try {
    if (!existsSync(LOCAL_GENERATIONS_FILE)) return { generations: [] };
    return JSON.parse(readFileSync(LOCAL_GENERATIONS_FILE, "utf-8")) as LocalGenerationsDB;
  } catch {
    return { generations: [] };
  }
}

function writeLocalGenerations(db: LocalGenerationsDB) {
  try {
    const dir = path.dirname(LOCAL_GENERATIONS_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(LOCAL_GENERATIONS_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Local saveGeneration error:", error);
  }
}

function saveGenerationLocal(userId: string, data: {
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
  const db = readLocalGenerations();
  const record: GenerationRecord = {
    id: `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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
    created_at: new Date().toISOString(),
  };

  db.generations = [record, ...db.generations].slice(0, 500);
  writeLocalGenerations(db);
}

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
  if (!supabase) {
    saveGenerationLocal(userId, data);
    return;
  }

  const { error } = await supabase.from("generations").insert({
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

  if (error) {
    console.error("Supabase saveGeneration error:", error);
    saveGenerationLocal(userId, data);
  }
}

export async function getUserGenerations(userId: string, limit = 20): Promise<GenerationRecord[]> {
  if (!supabase) {
    return readLocalGenerations().generations
      .filter((generation) => generation.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Supabase getUserGenerations error:", error);
    return readLocalGenerations().generations
      .filter((generation) => generation.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }
  return (data || []) as GenerationRecord[];
}
