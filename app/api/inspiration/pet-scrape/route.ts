import { json } from "@/lib/tiktok-adgen/http";
import { scrapeAndAnalyzePetCleaning } from "@/lib/inspiration/pet-scraper";

export const runtime = "nodejs";
export const maxDuration = 300; // 10 min timeout

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const cronSecret = process.env.CRON_SECRET;

  // Basic auth check
  if (cronSecret && token !== cronSecret) {
    return json(401, { error: "unauthorized", message: "Invalid or missing CRON_SECRET" });
  }

  const body = await req.json().catch(() => ({})) as {
    queries?: string[];
    videosPerQuery?: number;
    useMock?: boolean;
    analyzeWithAI?: boolean;
  };

  try {
    const result = await scrapeAndAnalyzePetCleaning({
      queries: body.queries,
      videosPerQuery: body.videosPerQuery || 10,
      useMock: body.useMock || process.env.SCRAPE_MOCK_DATA === "1",
      analyzeWithAI: body.analyzeWithAI !== false,
    });

    return json(200, {
      status: "completed",
      ...result,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Scrape failed";
    return json(500, { status: "failed", error: message });
  }
}

// GET endpoint to check current data status
export async function GET() {
  const { getPetCleaningKnowledge, getPetCleaningVideos } = await import("@/lib/inspiration/pet-scraper");

  const videos = await getPetCleaningVideos();
  const knowledge = await getPetCleaningKnowledge();

  return json(200, {
    videos: videos.length,
    knowledgeEntries: knowledge.length,
    categories: knowledge.map(k => ({
      category: k.category,
      videoCount: k.video_count,
      hookPatterns: k.hook_patterns.length,
    })),
  });
}
