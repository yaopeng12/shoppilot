import { json } from "@/lib/tiktok-adgen/http";
import { getUserGenerations } from "@/lib/inspiration/db";
import { getCurrentUser } from "@/lib/tiktok-adgen/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "auth_required" });

  const generations = await getUserGenerations(user.id);
  return json(200, { generations });
}
