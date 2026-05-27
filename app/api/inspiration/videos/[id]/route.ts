import { json } from "@/lib/tiktok-adgen/http";
import { getVideoById } from "@/lib/inspiration/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const video = await getVideoById(id);

  if (!video) {
    return json(404, { error: "not_found", message: "Video not found" });
  }

  return json(200, { video });
}
