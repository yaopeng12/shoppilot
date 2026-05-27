import { checkUsage, getCurrentUser, recordGeneration } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { fetchProduct } from "@/lib/tiktok-adgen/shopify";
import { generateAll } from "@/lib/tiktok-adgen/generator";
import type { AdStyle, TargetMarket } from "@/lib/tiktok-adgen/generator";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "auth_required", message: "Please sign in to generate scripts" });

  const { allowed, snapshot } = checkUsage(user.id, user.plan);
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

  recordGeneration(user.id);

  const generated = await generateAll(product, { style, targetMarket, scriptCount });
  return json(200, { ...generated, _usage: snapshot });
}
