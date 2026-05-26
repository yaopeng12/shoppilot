import { checkUsage, getCurrentUser, recordGeneration } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { fetchProduct } from "@/lib/tiktok-adgen/shopify";
import { generateStoryboard } from "@/lib/storyboard/generator";
import type { StoryboardOptions } from "@/lib/storyboard/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "auth_required", message: "Please sign in to generate storyboards" });

  const { allowed, snapshot } = checkUsage(user.id, user.plan);
  if (!allowed) {
    return json(429, {
      error: "limit_reached",
      message: "Daily limit reached. Upgrade to Pro for unlimited generations.",
      remaining: 0,
    });
  }

  const {
    url: productUrl,
    vertical,
    creativeAngle,
  } = (await req.json().catch(() => ({}))) as { url?: string } & StoryboardOptions;
  if (!productUrl) return json(400, { error: "URL is required" });

  let product;
  try {
    product = await fetchProduct(String(productUrl));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return json(400, { error: message });
  }

  recordGeneration(user.id);

  const storyboard = await generateStoryboard(product, { vertical, creativeAngle });
  return json(200, { ...storyboard, _usage: snapshot });
}
