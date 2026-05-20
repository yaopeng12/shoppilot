import { auth } from "@clerk/nextjs/server";
import { json } from "@/lib/tiktok-adgen/http";
import { getUserGenerations } from "@/lib/inspiration/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "auth_required" });

  const generations = await getUserGenerations(userId);
  return json(200, { generations });
}
