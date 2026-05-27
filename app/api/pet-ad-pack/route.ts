import { checkUsage, getCurrentUser, recordGeneration } from "@/lib/tiktok-adgen/auth";
import { json } from "@/lib/tiktok-adgen/http";
import { fetchProduct } from "@/lib/tiktok-adgen/shopify";
import { generatePetAdPack } from "@/lib/pet-ad-pack/generator";
import { saveGeneration } from "@/lib/inspiration/db";
import type { PetAdPackOptions } from "@/lib/pet-ad-pack/types";
import type { Product } from "@/lib/tiktok-adgen/types";

export const runtime = "nodejs";

function inferProductFromUrl(productUrl: string, userNote?: string): Product {
  let title = userNote?.trim() || "Pet cleaning product";
  const tags: string[] = [];

  try {
    const url = new URL(productUrl);
    const host = url.hostname.replace(/^www\./, "");
    tags.push(host);

    const parts = url.pathname
      .split("/")
      .map((part) => decodeURIComponent(part).replace(/\.\w+$/, ""))
      .filter(Boolean);
    const productIndex = parts.findIndex((part) => ["products", "product", "dp", "item", "items"].includes(part.toLowerCase()));
    const handle = productIndex >= 0 ? parts[productIndex + 1] : parts.at(-1);
    if (!userNote?.trim() && handle) {
      title = handle
        .replace(/[-_+]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .slice(0, 90);
    }
    if (handle) tags.push(handle);
  } catch {
    tags.push("manual_signal");
  }

  return {
    title,
    description: [
      `Product or competitor link could not be fetched directly, so use the URL as a product signal: ${productUrl}.`,
      userNote ? `User note: ${userNote}.` : "Infer a pet-cleaning angle from the URL and generate claim-safe creative.",
    ].join(" "),
    price: "",
    images: [],
    tags,
  };
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "auth_required", message: "Please sign in to generate an ad pack" });

  const { allowed, snapshot } = checkUsage(user.id, user.plan);
  if (!allowed) {
    return json(429, {
      error: "limit_reached",
      message: "Daily limit reached. Upgrade to Pro for unlimited generations.",
      remaining: 0,
    });
  }

  const {
    url: productUrl,
    targetMarket,
    userNote,
  } = (await req.json().catch(() => ({}))) as { url?: string } & PetAdPackOptions;
  if (!productUrl) return json(400, { error: "URL is required" });

  let product;
  try {
    product = await fetchProduct(String(productUrl));
  } catch (error: unknown) {
    console.warn("Pet ad pack product fetch fallback:", error instanceof Error ? error.message : error);
    product = inferProductFromUrl(String(productUrl), userNote);
  }

  recordGeneration(user.id);

  const adPack = await generatePetAdPack(product, { targetMarket, userNote });
  await saveGeneration(user.id, {
    productUrl: String(productUrl),
    productTitle: product.title,
    productPrice: product.price,
    productImage: product.images?.[0],
    style: adPack.selectedTemplate.name,
    category: adPack.detectedScenario,
    hooks: adPack.hooks,
    scripts: adPack.scripts,
    voiceovers: [adPack.voiceover],
    subtitles: [adPack.captions],
    hashtags: adPack.selectedSource.keywords.map((keyword) => `#${keyword.replace(/\s+/g, "")}`).slice(0, 8),
  });

  return json(200, { ...adPack, _usage: snapshot });
}
