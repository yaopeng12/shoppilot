import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

import { checkUsage, recordGeneration, generateApiKey } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { fetchProduct } from "@/lib/tiktok-adgen/shopify";
import { generateAll, type AdStyle, type TargetMarket } from "@/lib/tiktok-adgen/generator";
import { supabase } from "@/lib/inspiration/supabase";
import { inferCategory } from "@/lib/inspiration/category";
import { saveGeneration } from "@/lib/inspiration/db";
import type { PlanId } from "@/lib/tiktok-adgen/types";
import type { VideoAnalysis, KnowledgeEntry } from "@/lib/inspiration/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "auth_required", message: "Please sign in to generate scripts" });

  // Ensure user has an API key
  const user = await currentUser();
  if (user && !user.privateMetadata?.apiKey) {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: { apiKey: generateApiKey() },
    });
  }

  // Ensure user has a plan set
  if (user && !user.publicMetadata?.plan) {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { plan: "free" },
    });
  }

  const plan = (user?.publicMetadata?.plan as PlanId) || "free";
  const { allowed, snapshot } = checkUsage(userId, plan);
  if (!allowed) {
    return json(429, {
      error: "limit_reached",
      message: "Daily limit reached. Upgrade to Pro for unlimited generations.",
      remaining: 0,
    });
  }

  const { url: productUrl, style, targetMarket, scriptCount, refVideoId } = (await req.json().catch(() => ({}))) as {
    url?: string;
    style?: AdStyle;
    targetMarket?: TargetMarket;
    scriptCount?: number;
    refVideoId?: string;
  };
  if (!productUrl) return json(400, { error: "URL is required" });

  let product;
  try {
    product = await fetchProduct(String(productUrl));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return json(400, { error: message });
  }

  recordGeneration(userId);

  // Infer product category for knowledge base lookup
  const category = inferCategory(product);

  // Fetch trending video context and knowledge base in parallel
  let trendingContext: VideoAnalysis[] | undefined;
  let knowledge: KnowledgeEntry | undefined;
  if (supabase) {
    try {
      // If refVideoId is provided, load that specific video's analysis as primary context
      const refPromise = refVideoId
        ? supabase.from("video_analyses").select("*").eq("video_id", refVideoId).maybeSingle()
        : Promise.resolve({ data: null });

      const [trendingRes, knowledgeRes, refRes] = await Promise.all([
        supabase
          .from("video_analyses")
          .select("*, trending_videos!inner(view_count, product_category)")
          .order("trending_videos(view_count)", { ascending: false })
          .limit(5),
        category
          ? supabase.from("knowledge_base").select("*").eq("category", category).maybeSingle()
          : Promise.resolve({ data: null }),
        refPromise,
      ]);

      // If we have a reference video, prepend it to the trending context
      const refAnalysis = refRes.data as unknown as VideoAnalysis | null;
      const trending = (trendingRes.data || []) as unknown as VideoAnalysis[];
      trendingContext = refAnalysis ? [refAnalysis, ...trending] : trending.length ? trending : undefined;

      if (knowledgeRes.data) knowledge = knowledgeRes.data as KnowledgeEntry;
    } catch {
      // non-fatal, generation proceeds without context
    }
  }

  const generated = await generateAll(product, { trendingContext, knowledge, style, targetMarket, scriptCount });

  // Save generation to history (fire-and-forget)
  saveGeneration(userId, {
    productUrl: String(productUrl),
    productTitle: product.title,
    productPrice: product.price,
    productImage: product.images?.[0],
    style: style || undefined,
    category,
    hooks: generated.hooks,
    scripts: generated.scripts,
    voiceovers: generated.voiceovers,
    subtitles: generated.subtitles,
    hashtags: generated.hashtags,
  }).catch(() => {});

  const result = { ...generated, _usage: snapshot, _category: category };
  return json(200, result);
}
