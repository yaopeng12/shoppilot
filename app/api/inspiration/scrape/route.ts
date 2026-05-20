import { json } from "@/lib/tiktok-adgen/http";
import { scrapeAllCategories } from "@/lib/inspiration/scraper";
import { analyzeVideos } from "@/lib/inspiration/analyzer";
import { generateKnowledgeBase } from "@/lib/inspiration/batch-analyzer";
import {
  upsertVideos,
  upsertAnalyses,
  createScrapeJob,
  updateScrapeJob,
} from "@/lib/inspiration/db";

export const runtime = "nodejs";
export const maxDuration = 600; // 10 min timeout for 500 videos

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && token !== cronSecret) {
    return json(401, { error: "unauthorized", message: "Invalid or missing CRON_SECRET" });
  }

  // Allow overriding count and mock mode via request body (for testing)
  const body = await req.json().catch(() => ({})) as { count?: number; mock?: boolean };
  const targetCount = Math.min(Math.max(body.count || 500, 1), 2000);
  const useMock = body.mock === true || process.env.SCRAPE_MOCK_DATA === "1";

  const jobId = await createScrapeJob();

  try {
    // 1. Scrape trending videos across multiple countries and sort orders
    const videos = await scrapeAllCategories(7, undefined, targetCount, useMock);
    if (jobId) await updateScrapeJob(jobId, { videos_scraped: videos.length });

    if (videos.length === 0) {
      if (jobId) await updateScrapeJob(jobId, { status: "completed", error_message: "No videos scraped" });
      return json(200, { jobId, status: "completed", videosScraped: 0, videosAnalyzed: 0 });
    }

    // 2. Upsert videos to Supabase
    await upsertVideos(videos);

    // 3. Analyze each video with AI
    const analyses = await analyzeVideos(videos);
    const analyzed = await upsertAnalyses(analyses);
    if (jobId) await updateScrapeJob(jobId, { videos_analyzed: analyzed });

    // 4. Batch analyze: extract common patterns and generate knowledge base templates
    await generateKnowledgeBase(videos, analyses);

    // 5. Mark job complete
    if (jobId) await updateScrapeJob(jobId, { status: "completed" });

    return json(200, {
      jobId,
      status: "completed",
      videosScraped: videos.length,
      videosAnalyzed: analyzed,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Scrape failed";
    if (jobId) await updateScrapeJob(jobId, { status: "failed", error_message: message });
    return json(200, { jobId, status: "failed", error: message });
  }
}
