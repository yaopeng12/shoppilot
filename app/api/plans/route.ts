import { json } from "@/lib/tiktok-adgen/http";
import { PLANS } from "@/lib/tiktok-adgen/types";

export const runtime = "nodejs";

export async function GET() {
  return json(200, PLANS);
}
