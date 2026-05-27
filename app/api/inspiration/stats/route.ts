import { json } from "@/lib/tiktok-adgen/http";
import { getStats } from "@/lib/inspiration/db";

export const runtime = "nodejs";

export async function GET() {
  const stats = await getStats();
  return json(200, stats);
}
