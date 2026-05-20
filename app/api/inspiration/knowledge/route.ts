import { json } from "@/lib/tiktok-adgen/http";
import { getKnowledgeBase } from "@/lib/inspiration/db";

export const runtime = "nodejs";

export async function GET() {
  const entries = await getKnowledgeBase();
  return json(200, { entries });
}
