import type { NextRequest } from "next/server";

import { loadDB, saveDB } from "@/lib/tiktok-adgen/db";
import { checkUsage, getUser, recordUsage, usageSnapshot } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { fetchProduct } from "@/lib/tiktok-adgen/shopify";
import { generateAll } from "@/lib/tiktok-adgen/generator";
import { optionsResponse } from "@/lib/tiktok-adgen/session";

export const runtime = "nodejs";

export const OPTIONS = optionsResponse;

export async function POST(req: NextRequest) {
  const db = await loadDB();
  const user = getUser(db, req);
  if (!user) return json(401, { error: "auth_required", message: "Please sign in to generate scripts" });

  const usage = checkUsage(user);
  if (!usage.allowed) {
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

  recordUsage(user);
  await saveDB(db);

  const result = { ...generateAll(product), _usage: usageSnapshot(user) };
  return json(200, result);
}
