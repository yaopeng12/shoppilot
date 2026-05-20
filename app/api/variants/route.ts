import { auth } from "@clerk/nextjs/server";
import { json } from "@/lib/tiktok-adgen/http";
import { generateVariants, type VariantDimension } from "@/lib/tiktok-adgen/variants";
import type { TargetMarket } from "@/lib/tiktok-adgen/generator";
import { fetchProduct } from "@/lib/tiktok-adgen/shopify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return json(401, { error: "auth_required" });

  const body = await req.json().catch(() => ({})) as {
    product?: { title?: string; description?: string; price?: string };
    productUrl?: string;
    script?: {
      style?: string;
      hook?: { text: string; type: string };
      scenes: { time?: string; text: string; action?: string }[];
      cta?: { text: string; type: string };
      tone_notes?: string;
    };
    dimensions?: VariantDimension[];
    count?: number;
    targetMarket?: TargetMarket;
  };

  if (!body.script) return json(400, { error: "script is required" });

  const dimensions = body.dimensions || ["hook", "cta", "tone"];
  const count = Math.min(Math.max(body.count || 3, 1), 5);
  const targetMarket = body.targetMarket || "us";

  // Resolve product info
  let product = body.product ? {
    title: body.product.title || "",
    description: body.product.description || "",
    price: body.product.price || "",
    images: [] as string[],
    tags: [] as string[],
  } : null;

  if (!product && body.productUrl) {
    try {
      product = await fetchProduct(body.productUrl);
    } catch {
      return json(400, { error: "Failed to fetch product" });
    }
  }

  if (!product) return json(400, { error: "product or productUrl is required" });

  const variants = await generateVariants(product, body.script, dimensions, count, targetMarket);

  return json(200, { variants, product });
}
