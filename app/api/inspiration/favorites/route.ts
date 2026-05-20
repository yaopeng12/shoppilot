import { auth } from "@clerk/nextjs/server";
import { json } from "@/lib/tiktok-adgen/http";
import { getUserFavorites, toggleFavorite } from "@/lib/inspiration/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "auth_required" });

  const favorites = await getUserFavorites(userId);
  return json(200, { favorites });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "auth_required" });

  const { videoId } = (await req.json().catch(() => ({}))) as { videoId?: string };
  if (!videoId) return json(400, { error: "videoId is required" });

  const result = await toggleFavorite(userId, videoId);
  return json(200, result);
}
