import { json } from "@/lib/tiktok-adgen/http";
import { getKnowledgeBase } from "@/lib/inspiration/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const entries = await getKnowledgeBase(url.searchParams.get("targetMarket") || undefined);
  return json(200, { entries });
}
