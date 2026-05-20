import { auth } from "@clerk/nextjs/server";
import { json } from "@/lib/tiktok-adgen/http";
import { analyzeVideo } from "@/lib/inspiration/analyzer";
import type { TrendingVideo } from "@/lib/inspiration/types";

export const runtime = "nodejs";

function extractVideoId(url: string): string | null {
  // Handle various TikTok URL formats
  const patterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /tiktok\.com\/v\/(\d+)/,
    /vm\.tiktok\.com\/(\w+)/,
    /tiktok\.com\/t\/(\w+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchVideoMeta(url: string): Promise<Partial<TrendingVideo>> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/)?.[1]
      || html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/)?.[1]
      || null;

    const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/)?.[1]
      || html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/)?.[1]
      || null;

    const authorMatch = html.match(/"@author"\s*:\s*"([^"]+)"/) || html.match(/"author"\s*:\s*\{\s*"name"\s*:\s*"([^"]+)"/);
    const author = authorMatch?.[1] || null;

    // Try to extract engagement from JSON-LD or embedded data
    const viewMatch = html.match(/"playCount"\s*:\s*(\d+)/);
    const likeMatch = html.match(/"diggCount"\s*:\s*(\d+)/);
    const commentMatch = html.match(/"commentCount"\s*:\s*(\d+)/);
    const shareMatch = html.match(/"shareCount"\s*:\s*(\d+)/);

    return {
      title: ogTitle || ogDesc || null,
      author_name: author,
      view_count: viewMatch ? parseInt(viewMatch[1], 10) : 0,
      like_count: likeMatch ? parseInt(likeMatch[1], 10) : 0,
      comment_count: commentMatch ? parseInt(commentMatch[1], 10) : 0,
      share_count: shareMatch ? parseInt(shareMatch[1], 10) : 0,
    };
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "auth_required" });

  const body = await req.json().catch(() => ({})) as {
    videoUrl?: string;
    title?: string;
    category?: string;
  };

  if (!body.videoUrl) return json(400, { error: "videoUrl is required" });

  const videoId = extractVideoId(body.videoUrl) || `url_${Date.now()}`;

  // Try to fetch metadata from the URL, with user-provided values as override
  const meta = await fetchVideoMeta(body.videoUrl);

  const video: TrendingVideo = {
    id: videoId,
    video_url: body.videoUrl,
    thumbnail_url: null,
    title: body.title || meta.title || null,
    author_name: meta.author_name || null,
    author_avatar: null,
    product_category: body.category || null,
    view_count: meta.view_count || 0,
    like_count: meta.like_count || 0,
    comment_count: meta.comment_count || 0,
    share_count: meta.share_count || 0,
    country_code: "US",
    hashtags: [],
    duration_seconds: null,
    scraped_at: new Date().toISOString(),
    source_period: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const analysis = await analyzeVideo(video);

  return json(200, { video, analysis });
}
