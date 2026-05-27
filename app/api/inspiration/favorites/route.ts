import { json } from "@/lib/tiktok-adgen/http";
import { getUserFavorites, toggleFavorite } from "@/lib/inspiration/db";
import { getCurrentUser } from "@/lib/tiktok-adgen/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "auth_required" });

  const favorites = await getUserFavorites(user.id);
  return json(200, { favorites });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "auth_required" });

  const { videoId } = (await req.json().catch(() => ({}))) as { videoId?: string };
  if (!videoId) return json(400, { error: "videoId is required" });

  const result = await toggleFavorite(user.id, videoId);
  return json(200, result);
}
