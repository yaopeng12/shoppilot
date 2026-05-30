import {
  TARGET_MARKET_CODES,
  getLocalizedTemplateSignal,
  getMarketProfile,
  normalizeTargetMarket,
  type TargetMarketCode,
} from "@/lib/localization/markets";
import type { MarketPlaybook, TrendingVideo } from "./types";
import type { Product } from "@/lib/tiktok-adgen/types";

const COUNTRY_TO_MARKET: Record<string, TargetMarketCode> = {
  US: "en-US",
  CA: "en-US",
  AU: "en-GB",
  GB: "en-GB",
  UK: "en-GB",
  TH: "th",
  ID: "id",
  VN: "vi",
  MY: "ms",
  JP: "ja",
  MX: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  BR: "pt-BR",
};

const MARKET_KEYWORDS: Record<TargetMarketCode, string[]> = {
  "en-US": ["us", "usa", "america", "apartment", "pet parent", "tiktokmademebuyit"],
  "en-GB": ["uk", "british", "flat", "sorted", "cleanhomeuk", "pettokuk"],
  th: ["thai", "thailand", "กรุงเทพ", "สัตว์เลี้ยง", "บ้าน"],
  id: ["indonesia", "jakarta", "rumah", "jujur", "kepake", "bersih"],
  vi: ["vietnam", "hanoi", "saigon", "nhà", "sạch", "thú cưng"],
  ms: ["malaysia", "kuala", "rumah", "bau", "senang", "berbaloi"],
  ja: ["japan", "tokyo", "日本", "猫", "掃除", "ペット"],
  es: ["mexico", "latam", "casa", "mascotas", "limpia", "truco"],
  "pt-BR": ["brasil", "brazil", "casa", "limpa", "pets", "dica"],
};

function engagementRate(video: TrendingVideo): number {
  // If view_count is 0 but we have likes, estimate view_count from likes
  // Typical TikTok like rate is around 5-15%, we use 8% as default
  const viewCount = video.view_count || (video.like_count > 0 ? Math.round(video.like_count / 0.08) : 0);

  if (!viewCount) return 0;
  return (video.like_count + video.comment_count * 3 + video.share_count * 5) / viewCount;
}

function textSignal(video: TrendingVideo): string {
  return [video.title, video.author_name, video.product_category, ...(video.hashtags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function countryMarket(video: TrendingVideo): TargetMarketCode | null {
  const code = video.country_code?.toUpperCase();
  return code ? COUNTRY_TO_MARKET[code] || null : null;
}

function confidenceFrom(score: number): MarketPlaybook["confidence"] {
  if (score >= 78) return "high";
  if (score >= 58) return "medium";
  return "low";
}

export function inferVideoMarketPlaybook(video: TrendingVideo, requestedMarket?: string): MarketPlaybook {
  const requested = normalizeTargetMarket(requestedMarket);
  const likelyCountryMarket = countryMarket(video);
  const text = textSignal(video);
  const engagement = Math.min(18, Math.round(engagementRate(video) * 300));

  const marketScores = TARGET_MARKET_CODES.map((market) => {
    const profile = getMarketProfile(market);
    let score = 34 + engagement;
    const reasons: string[] = [];

    if (likelyCountryMarket === market) {
      score += 34;
      reasons.push(`country signal ${video.country_code}`);
    }

    if (requested === market) {
      score += 10;
      reasons.push("selected target market");
    }

    const keywordHits = MARKET_KEYWORDS[market].filter((keyword) => text.includes(keyword.toLowerCase()));
    if (keywordHits.length > 0) {
      score += Math.min(22, keywordHits.length * 7);
      reasons.push(`local text signals: ${keywordHits.slice(0, 3).join(", ")}`);
    }

    if (market === "en-US" && !likelyCountryMarket && /tiktok|amazon|shopify|pet/i.test(text)) {
      score += 8;
      reasons.push("broad English ecommerce signal");
    }

    return {
      market,
      label: profile.label,
      score: Math.min(100, score),
      reason: reasons.join("; ") || "category and engagement similarity",
    };
  }).sort((a, b) => b.score - a.score);

  const winner = marketScores[0];
  const profile = getMarketProfile(winner.market);
  const signal = getLocalizedTemplateSignal(
    {
      painPoint: video.product_category || "pet_cleaning",
      productCategory: video.product_category || "pet cleaning product",
      useScene: "pet home",
    },
    winner.market,
  );

  return {
    primaryMarket: winner.market,
    primaryMarketLabel: profile.targetMarket,
    confidence: confidenceFrom(winner.score),
    reason: winner.reason,
    marketScores: marketScores.slice(0, 4),
    hookAngle: signal.opener,
    tone: profile.tone,
    cta: signal.cta,
    creativeNotes: [
      signal.culturalNote,
      `Use ${profile.creatorVoiceReference}.`,
      `Adapt proof around visible pet-home cleanup, not unsupported product claims.`,
    ],
    localizationRisks: profile.forbidden.slice(0, 4),
  };
}

export function inferProductMarketPlaybook(product: Product, requestedMarket?: string): MarketPlaybook {
  const market = normalizeTargetMarket(requestedMarket);
  const profile = getMarketProfile(market);
  const signal = getLocalizedTemplateSignal(
    {
      productName: product.title,
      painPoint: product.description || product.tags?.join(" ") || "pet_cleaning",
      productCategory: product.tags?.[0] || "pet cleaning product",
      useScene: "pet home",
    },
    market,
  );

  return {
    primaryMarket: market,
    primaryMarketLabel: profile.targetMarket,
    confidence: "medium",
    reason: "selected generation market; product page does not provide native play-region metrics",
    marketScores: [
      { market, label: profile.label, score: 76, reason: "selected target market" },
      ...TARGET_MARKET_CODES.filter((code) => code !== market).slice(0, 3).map((code) => ({
        market: code,
        label: getMarketProfile(code).label,
        score: 52,
        reason: "secondary expansion candidate",
      })),
    ],
    hookAngle: signal.opener,
    tone: profile.tone,
    cta: signal.cta,
    creativeNotes: [
      signal.culturalNote,
      `Make the offer sound native to ${profile.targetMarket}, not translated.`,
      "Test first-three-second hooks separately by market before scaling spend.",
    ],
    localizationRisks: profile.forbidden.slice(0, 4),
  };
}
