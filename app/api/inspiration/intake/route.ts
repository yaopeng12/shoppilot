import { json } from "@/lib/tiktok-adgen/http";
import { intakeVideo, intakeVideos, getIntakeStats } from "@/lib/inspiration/video-intake";
import { getCurrentUser } from "@/lib/tiktok-adgen/auth";

export const runtime = "nodejs";
export const maxDuration = 120;

// POST - Submit video(s) for analysis and intake
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return json(401, { error: "auth_required", message: "Please sign in to submit videos" });
  }

  const body = await req.json().catch(() => ({})) as {
    url?: string;
    urls?: string[];
    title?: string;
    author?: string;
    category?: string;
    userNote?: string;
  };

  // Single video submission
  if (body.url) {
    try {
      const result = await intakeVideo({
        url: body.url,
        title: body.title,
        author: body.author,
        category: body.category,
        userNote: body.userNote,
      });

      return json(200, {
        success: true,
        video: {
          id: result.video.id,
          url: result.video.video_url,
          title: result.video.title,
          category: result.video.product_category,
        },
        analysis: {
          hooks: result.analysis.hooks,
          structure: result.analysis.video_structure,
          ctaPatterns: result.analysis.cta_patterns,
          toneStyle: result.analysis.tone_style,
          keyTakeaways: result.analysis.key_takeaways,
        },
        qualified: result.qualified,
        reason: result.reason,
      });
    } catch (e) {
      return json(500, {
        success: false,
        error: e instanceof Error ? e.message : "Analysis failed",
      });
    }
  }

  // Batch submission
  if (body.urls && body.urls.length > 0) {
    if (body.urls.length > 20) {
      return json(400, { error: "Maximum 20 videos per batch" });
    }

    try {
      const results = await intakeVideos(
        body.urls.map(url => ({
          url,
          category: body.category,
          userNote: body.userNote,
        }))
      );

      return json(200, {
        success: true,
        results: results.map(r => ({
          url: r.video.video_url,
          category: r.video.product_category,
          qualified: r.qualified,
          reason: r.reason,
          hooks: r.analysis.hooks.slice(0, 3),
        })),
        summary: {
          total: results.length,
          qualified: results.filter(r => r.qualified).length,
        },
      });
    } catch (e) {
      return json(500, {
        success: false,
        error: e instanceof Error ? e.message : "Batch analysis failed",
      });
    }
  }

  return json(400, { error: "Provide 'url' for single video or 'urls' for batch" });
}

// GET - Get intake statistics
export async function GET() {
  const stats = await getIntakeStats();

  return json(200, {
    totalVideos: stats.totalVideos,
    qualifiedVideos: stats.qualifiedVideos,
    categories: stats.categories,
    qualificationRate: stats.totalVideos > 0
      ? Math.round((stats.qualifiedVideos / stats.totalVideos) * 100)
      : 0,
  });
}
