import { json } from "@/lib/tiktok-adgen/http";
import { getCurrentUser } from "@/lib/tiktok-adgen/auth";
import { intakeVideo } from "@/lib/inspiration/video-intake";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "auth_required" });

  const body = await req.json().catch(() => ({})) as {
    videoUrl?: string;
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

  if (!body.videoUrl) return json(400, { error: "videoUrl is required" });

  try {
    // Use intake system to analyze and store the video
    const result = await intakeVideo({
      url: body.videoUrl,
      title: body.title,
      author: body.author,
      category: body.category,
      userNote: body.userNote,
      targetMarket: body.targetMarket,
      // Pass user-provided metrics
      viewCount: body.viewCount,
      likeCount: body.likeCount,
      commentCount: body.commentCount,
      shareCount: body.shareCount,
    });

    return json(200, {
      video: result.video,
      analysis: result.analysis,
      qualified: result.qualified,
      reason: result.reason,
    });
  } catch (e) {
    return json(500, {
      error: e instanceof Error ? e.message : "Analysis failed",
    });
  }
}
