import type { NextRequest } from "next/server";

import { json } from "@/lib/tiktok-adgen/http";
import { PLANS } from "@/lib/tiktok-adgen/types";
import { optionsResponse } from "@/lib/tiktok-adgen/session";

export const runtime = "nodejs";

export const OPTIONS = optionsResponse;

export async function GET(_req: NextRequest) {
  return json(200, PLANS);
}
