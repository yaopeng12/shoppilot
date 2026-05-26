import { getCurrentUser } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "Not authenticated" });
  return json(200, { _empty: true });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "Not authenticated" });
  return json(501, { error: "Team functionality requires database setup" });
}
