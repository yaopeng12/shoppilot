import { auth } from "@clerk/nextjs/server";
import { json } from "@/lib/tiktok-adgen/http";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "Not authenticated" });
  // Team functionality placeholder — requires persistent DB to fully implement
  return json(200, { _empty: true });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "Not authenticated" });
  // Team functionality placeholder — requires persistent DB to fully implement
  return json(501, { error: "Team functionality requires database setup" });
}
