import { json } from "@/lib/tiktok-adgen/http";
import { getVideos } from "@/lib/inspiration/db";
import type { InspirationFilters } from "@/lib/inspiration/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filters: InspirationFilters = {
    category: url.searchParams.get("category") || undefined,
    targetMarket: url.searchParams.get("targetMarket") || undefined,
    period: (url.searchParams.get("period") as "7d" | "30d") || undefined,
    sort: (url.searchParams.get("sort") as InspirationFilters["sort"]) || "views",
    search: url.searchParams.get("search") || undefined,
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Math.min(Number(url.searchParams.get("pageSize")) || 20, 50),
  };

  const { videos, total } = await getVideos(filters);

  return json(200, {
    videos,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  });
}
