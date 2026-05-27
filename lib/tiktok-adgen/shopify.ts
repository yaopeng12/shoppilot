import type { Product } from "./types";

async function fetchText(url: string) {
  const res = await fetch(url, {
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const body = await res.text();
  return { status: res.status, body };
}

function getProductHandle(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("products");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1].replace(/\.\w+$/, "");
  } catch {}
  return null;
}

// --- Shopify ---

async function tryShopifyJsonAPI(baseUrl: string): Promise<Product | null> {
  const handle = getProductHandle(baseUrl);
  if (!handle) return null;
  try {
    const u = new URL(baseUrl);
    const jsonUrl = `${u.origin}/products/${handle}.json`;
    const { status, body } = await fetchText(jsonUrl);
    if (status === 200) {
      const data = JSON.parse(body) as any;
      const p = data.product;
      if (!p) return null;
      return {
        title: p.title || "",
        description: (p.body_html || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/&[a-z]+;/gi, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 500),
        price: p.variants?.[0]?.price ? `$${p.variants[0].price}` : "",
        images: (p.images || []).map((i: any) => i.src).slice(0, 4),
        tags: (p.tags || "")
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      };
    }
  } catch {}
  return null;
}

async function tryShopifyJsEndpoint(baseUrl: string): Promise<Product | null> {
  const handle = getProductHandle(baseUrl);
  if (!handle) return null;
  try {
    const u = new URL(baseUrl);
    const jsUrl = `${u.origin}/products/${handle}.js`;
    const { status, body } = await fetchText(jsUrl);
    if (status === 200) {
      const data = JSON.parse(body) as any;
      return {
        title: data.title || "",
        description: (data.description || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/&[a-z]+;/gi, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 500),
        price: data.price ? `$${(data.price / 100).toFixed(2)}` : "",
        images: (data.images || []).map((i: any) => (typeof i === "string" ? i : i.src)).slice(0, 4),
        tags: (data.tags || []).map((t: any) => (typeof t === "string" ? t : "")).filter(Boolean),
      };
    }
  } catch {}
  return null;
}

// --- Amazon ---

function isAmazonUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return /amazon\.(com|co\.uk|de|fr|es|it|ca|com\.au|co\.jp|in|com\.br|sg|ae|sa|nl|se|pl|com\.mx)$/i.test(host);
  } catch {
    return false;
  }
}

function extractAmazon(html: string): Product {
  const product: Product = { title: "", description: "", price: "", images: [], tags: [] };

  // Title: #productTitle
  const titleMatch = html.match(/id=["']productTitle["'][^>]*>([\s\S]*?)<\/(?:span|h1)/i);
  if (titleMatch) product.title = titleMatch[1].replace(/<[^>]+>/g, "").trim();

  // Price: .a-price .a-offscreen or data-asin-price
  const priceMatch =
    html.match(/class=["'][^"']*a-offscreen[^"']*["'][^>]*>\s*([\$\£\€\¥][\d,.]+)/i) ||
    html.match(/data-asin-price=["']([\d,.]+)["']/i) ||
    html.match(/id=["']priceblock_ourprice["'][^>]*>([\s\S]*?\$[\d,.]+)/i);
  if (priceMatch) {
    const raw = priceMatch[1].replace(/<[^>]+>/g, "").trim();
    product.price = raw.startsWith("$") || raw.startsWith("£") || raw.startsWith("€") || raw.startsWith("¥")
      ? raw
      : `$${raw}`;
  }

  // Images: data-old-hires or hiRes
  const imgMatches = html.match(/data-old-hires=["'](https:[^"']+)["']/gi) || [];
  for (const m of imgMatches) {
    const url = m.match(/data-old-hires=["'](https:[^"']+)["']/i)?.[1];
    if (url && !product.images.includes(url)) product.images.push(url);
    if (product.images.length >= 4) break;
  }
  if (product.images.length === 0) {
    const hiResMatch = html.match(/"hiRes":"(https:[^"]+)"/i);
    if (hiResMatch) product.images.push(hiResMatch[1]);
  }

  // Description: #feature-bullets or #productDescription
  const bulletsMatch = html.match(/id=["']feature-bullets["'][\s\S]*?<ul[\s\S]*?<\/ul>/i);
  if (bulletsMatch) {
    const items = bulletsMatch[0].match(/<span[^>]*>([\s\S]*?)<\/span>/gi) || [];
    product.description = items
      .map((s) => s.replace(/<[^>]+>/g, "").trim())
      .filter((s) => s.length > 5)
      .join(". ")
      .slice(0, 500);
  }
  if (!product.description) {
    const descMatch = html.match(/id=["']productDescription["'][^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) product.description = descMatch[1].replace(/<[^>]+>/g, "").trim().slice(0, 500);
  }

  // Category as tag
  const catMatch = html.match(/id=["']wayfinding-breadcrumbs[^"']*["'][\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
  if (catMatch) {
    const cat = catMatch[1].replace(/<[^>]+>/g, "").trim();
    if (cat) product.tags.push(cat);
  }

  return product;
}

// --- Generic HTML extraction (JSON-LD, meta tags, OG) ---

function extractProduct(html: string): Product {
  const product: Product = { title: "", description: "", price: "", images: [], tags: [] };

  // JSON-LD structured data (used by WooCommerce, BigCommerce, Magento, Squarespace, Wix, etc.)
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const m of jsonLdMatch) {
      try {
        const jsonTxt = m.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
        const json = JSON.parse(jsonTxt) as any;
        const findProduct = (obj: any): any => {
          if (!obj || typeof obj !== "object") return null;
          if (obj["@type"] === "Product") return obj;
          if (Array.isArray(obj)) {
            for (const i of obj) {
              const r = findProduct(i);
              if (r) return r;
            }
          }
          for (const k of Object.keys(obj)) {
            const r = findProduct(obj[k]);
            if (r) return r;
          }
          return null;
        };
        const p = findProduct(json);
        if (p) {
          product.title = product.title || p.name || "";
          product.description =
            product.description || (typeof p.description === "string" ? p.description.replace(/<[^>]+>/g, "").slice(0, 500) : "");
          if (p.image) {
            const imgs = Array.isArray(p.image) ? p.image : [p.image];
            product.images.push(...imgs.filter((i: any) => typeof i === "string").slice(0, 4));
          }
          if (p.offers) {
            const offers = Array.isArray(p.offers) ? p.offers[0] : p.offers;
            product.price = product.price || (offers.price ? `${offers.priceCurrency || "$"}${offers.price}` : "");
          }
          if (p.brand?.name) product.tags.push(p.brand.name);
          if (p.category) product.tags.push(p.category);
        }
      } catch {}
    }
  }

  // Shopify embedded product JSON
  const shopifyMatch = html.match(/"product":\s*(\{[\s\S]*?\})\s*,\s*"page_type"/);
  if (shopifyMatch) {
    try {
      const sp = JSON.parse(shopifyMatch[1]) as any;
      product.title = product.title || sp.title || "";
      product.description = product.description || (sp.body_html ? sp.body_html.replace(/<[^>]+>/g, "").slice(0, 500) : sp.description || "");
      if (sp.images) product.images.push(...sp.images.map((i: any) => i.src).slice(0, 4));
      if (sp.variants && sp.variants[0]) product.price = product.price || (sp.variants[0].price ? `$${sp.variants[0].price}` : "");
    } catch {}
  }

  // WooCommerce embedded product JSON (woo-product-gallery, etc.)
  const wooMatch = html.match(/wc_single_product_params\s*=\s*\{[\s\S]*?"i18n_required_rating_text"/);
  if (!wooMatch) {
    // Try alternative WooCommerce data
    const wooJsonMatch = html.match(/"product":\s*\{[\s\S]*?"variation_id"/);
    if (wooJsonMatch) {
      // WooCommerce detected, JSON-LD usually covers it
    }
  }

  // Open Graph meta tags
  if (!product.title) {
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    product.title = ogTitle ? ogTitle[1] : (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "Product";
  }
  if (!product.description) {
    const ogDesc =
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    product.description = ogDesc ? ogDesc[1].slice(0, 500) : "";
  }
  if (!product.price) {
    const priceMatch =
      html.match(/<meta[^>]*property=["']og:price:amount["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<span[^>]*class=["'][^"']*price[^"']*["'][^>]*>\s*\$?([\d,.]+)/i);
    product.price = priceMatch ? `$${priceMatch[1]}` : "";
  }
  if (product.images.length === 0) {
    const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImg) product.images.push(ogImg[1]);
  }

  product.description = product.description.replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
  return product;
}

// --- Main entry ---

export async function fetchProduct(inputUrl: string): Promise<Product> {
  let normalizedUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = "https://" + normalizedUrl;
  // eslint-disable-next-line no-new
  new URL(normalizedUrl);

  // Amazon: dedicated extractor (they block most API-style requests)
  if (isAmazonUrl(normalizedUrl)) {
    const { status, body: html } = await fetchText(normalizedUrl);
    if (status >= 400) throw new Error(`Failed to fetch page (HTTP ${status})`);
    const product = extractAmazon(html);
    if (product.title) return product;
    // Fall through to generic extraction
    return extractProduct(html);
  }

  // Shopify: try fast JSON endpoints first
  let product = await tryShopifyJsonAPI(normalizedUrl);
  if (!product || !product.title) product = await tryShopifyJsEndpoint(normalizedUrl);
  if (product && product.title) return product;

  // Generic: HTML scraping (works for WooCommerce, BigCommerce, Magento, Squarespace, Wix, etc.)
  const { status, body: html } = await fetchText(normalizedUrl);
  if (status >= 400) throw new Error(`Failed to fetch page (HTTP ${status})`);
  return extractProduct(html);
}
