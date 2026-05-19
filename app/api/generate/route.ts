import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

import { checkUsage, recordGeneration, generateApiKey } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { fetchProduct } from "@/lib/tiktok-adgen/shopify";
import { generateAll } from "@/lib/tiktok-adgen/generator";
import type { PlanId } from "@/lib/tiktok-adgen/types";

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

  const { url: productUrl } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!productUrl) return json(400, { error: "URL is required" });

  let product;
  try {
    product = await fetchProduct(String(productUrl));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return json(400, { error: message });
  }

  recordGeneration(userId);

  const generated = await generateAll(product);
  const result = { ...generated, _usage: snapshot };
  return json(200, result);
}
