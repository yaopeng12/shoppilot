import type { TrendingVideo } from "./types";

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type RawVideo = {
  video_id?: string;
  id?: string;
  video_url?: string;
  url?: string;
  thumbnail_url?: string;
  cover_url?: string;
  title?: string;
  video_title?: string;
  author_name?: string;
  creator_name?: string;
  author_avatar?: string;
  category_name?: string;
  industry_key?: string;
  view_count?: number;
  vv?: number;
  like_count?: number;
  like_cnt?: number;
  comment_count?: number;
  comment_cnt?: number;
  share_count?: number;
  share_cnt?: number;
  country_code?: string;
  region?: string;
  hashtags?: string[];
  tag_list?: string[];
  duration?: number;
  video_duration?: number;
};

function parseVideo(raw: RawVideo, period: string): TrendingVideo | null {
  const id = raw.video_id || raw.id;
  if (!id) return null;

  return {
    id: String(id),
    video_url: raw.video_url || raw.url || `https://www.tiktok.com/@${raw.author_name || "unknown"}/video/${id}`,
    thumbnail_url: raw.thumbnail_url || raw.cover_url || null,
    title: raw.title || raw.video_title || null,
    author_name: raw.author_name || raw.creator_name || null,
    author_avatar: raw.author_avatar || null,
    product_category: raw.category_name || raw.industry_key || null,
    view_count: raw.view_count || raw.vv || 0,
    like_count: raw.like_count || raw.like_cnt || 0,
    comment_count: raw.comment_count || raw.comment_cnt || 0,
    share_count: raw.share_count || raw.share_cnt || 0,
    country_code: raw.country_code || raw.region || "US",
    hashtags: raw.hashtags || raw.tag_list || [],
    duration_seconds: raw.duration || raw.video_duration || null,
    scraped_at: new Date().toISOString(),
    source_period: period,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function fetchCreativeCenterAPIWithParams(params: URLSearchParams): Promise<RawVideo[]> {
  const res = await fetch(
    `https://ads.tiktok.com/creative_radar_api/v1/popular/video/list?${params}`,
    {
      headers: {
        "User-Agent": randomUA(),
        Accept: "application/json",
        Referer: "https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    },
  );

  if (!res.ok) return [];

  const data = await res.json() as any;
  return data?.data?.list || data?.data?.videos || [];
}

async function scrapeHTMLFallback(period: string): Promise<TrendingVideo[]> {
  try {
    const res = await fetch(
      "https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en",
      {
        headers: {
          "User-Agent": randomUA(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      },
    );

    if (!res.ok) return [];

    const html = await res.text();
    const videos: TrendingVideo[] = [];

    // Try __NEXT_DATA__
    const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const videoList = nextData?.props?.pageProps?.videoList ||
          nextData?.props?.pageProps?.videos ||
          nextData?.props?.pageProps?.initialData || [];
        if (Array.isArray(videoList)) {
          for (const raw of videoList) {
            const v = parseVideo(raw, period);
            if (v) videos.push(v);
          }
        }
      } catch {}
    }

    return videos;
  } catch {
    return [];
  }
}

const DEFAULT_COUNTRIES = ["US", "GB", "TH", "ID", "VN", "MY", "JP", "MX", "BR"];
const SORT_OPTIONS = ["vv", "like", "comment"] as const;

// --- Mock data for development/testing when TikTok API is unreachable ---

const MOCK_PRODUCTS = [
  { name: "LED Face Mask", category: "Beauty", price: "$29.99" },
  { name: "Wireless Earbuds Pro", category: "Electronics", price: "$49.99" },
  { name: "Posture Corrector", category: "Health", price: "$19.99" },
  { name: "Portable Blender", category: "Home", price: "$34.99" },
  { name: "Yoga Pants Scrunch", category: "Fashion", price: "$24.99" },
  { name: "Phone Camera Lens Kit", category: "Electronics", price: "$15.99" },
  { name: "Ice Roller Face", category: "Beauty", price: "$12.99" },
  { name: "Resistance Bands Set", category: "Sports", price: "$16.99" },
  { name: "Mini Projector", category: "Electronics", price: "$59.99" },
  { name: "Hair Growth Serum", category: "Beauty", price: "$22.99" },
  { name: "Smart Water Bottle", category: "Sports", price: "$27.99" },
  { name: "Kitchen Organizer Set", category: "Home", price: "$18.99" },
  { name: "Lip Gloss Set", category: "Beauty", price: "$9.99" },
  { name: "Car Phone Mount", category: "Electronics", price: "$11.99" },
  { name: "Weighted Blanket", category: "Home", price: "$39.99" },
];

const MOCK_HOOKS = [
  "TikTok made me buy this and I don't regret it",
  "Stop scrolling! You NEED this in your life",
  "POV: you just found the best product ever",
  "I tested this for 30 days — here's the truth",
  "The internet is OBSESSED with this",
  "Things that just make sense",
  "Why didn't anyone tell me about this sooner",
  "The best $20 I've ever spent",
  "This changed my morning routine forever",
  "You won't believe what this does",
];

const MOCK_AUTHORS = [
  "techreviewer", "beautyblogger", "fitlife_mike", "homehacks", "gadgetguru",
  "skincarequeen", "workoutwizard", "diymaster", "trendhunter", "lifestylejane",
  "shopwithme", "unboxking", "reviewpro", "dailydeals", "viralpicks",
];

function generateMockVideos(count: number): TrendingVideo[] {
  const videos: TrendingVideo[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const product = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length];
    const author = MOCK_AUTHORS[i % MOCK_AUTHORS.length];
    const views = Math.floor(Math.random() * 5000000) + 100000;
    const likes = Math.floor(views * (0.05 + Math.random() * 0.15));
    const comments = Math.floor(likes * (0.02 + Math.random() * 0.08));
    const shares = Math.floor(likes * (0.01 + Math.random() * 0.05));

    videos.push({
      id: `mock_${i + 1}_${Date.now()}`,
      video_url: `https://www.tiktok.com/@${author}/video/${7000000000 + i}`,
      thumbnail_url: `https://placehold.co/480x854/1a1a2e/eee?text=${encodeURIComponent(product.name)}`,
      title: `${MOCK_HOOKS[i % MOCK_HOOKS.length]} — ${product.name}`,
      author_name: author,
      author_avatar: `https://placehold.co/48x48/2d2d44/eee?text=${author[0].toUpperCase()}`,
      product_category: product.category,
      view_count: views,
      like_count: likes,
      comment_count: comments,
      share_count: shares,
      country_code: DEFAULT_COUNTRIES[i % DEFAULT_COUNTRIES.length],
      hashtags: ["tiktokmademebuyit", "trending", product.name.toLowerCase().replace(/\s+/g, ""), "viral", "fyp"],
      duration_seconds: 15 + Math.floor(Math.random() * 30),
      scraped_at: new Date(now.getTime() - Math.random() * 7 * 24 * 3600 * 1000).toISOString(),
      source_period: "7d",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }

  return videos;
}

export async function scrapeAllCategories(
  periodDays: 7 | 30 = 7,
  countries: string[] = DEFAULT_COUNTRIES,
  targetCount = 500,
  useMock = false,
): Promise<TrendingVideo[]> {
  // Allow mock mode via env var or parameter
  if (useMock || process.env.SCRAPE_MOCK_DATA === "1") {
    return generateMockVideos(targetCount);
  }

  const period = String(periodDays) + "d";
  const allVideos: TrendingVideo[] = [];
  const seen = new Set<string>();

  for (const country of countries) {
    if (allVideos.length >= targetCount) break;

    for (const sortBy of SORT_OPTIONS) {
      if (allVideos.length >= targetCount) break;

      for (let page = 1; page <= 10; page++) {
        if (allVideos.length >= targetCount) break;

        const params = new URLSearchParams({
          period: String(periodDays),
          country_code: country,
          limit: "20",
          page: String(page),
          sort_by: sortBy,
        });

        const rawVideos = await fetchCreativeCenterAPIWithParams(params);

        if (rawVideos.length === 0 && page === 1) {
          if (sortBy === "vv") {
            const fallback = await scrapeHTMLFallback(period);
            for (const v of fallback) {
              if (!seen.has(v.id)) {
                seen.add(v.id);
                allVideos.push(v);
              }
            }
          }
          break;
        }

        for (const raw of rawVideos) {
          const v = parseVideo(raw, period);
          if (v && !seen.has(v.id)) {
            seen.add(v.id);
            allVideos.push(v);
          }
        }

        if (rawVideos.length < 20) break;
        await sleep(800 + Math.random() * 1500);
      }
    }
  }

  // If no real data fetched, fall back to mock data
  if (allVideos.length === 0) {
    console.warn("No videos scraped from API, falling back to mock data");
    return generateMockVideos(targetCount);
  }

  return allVideos.slice(0, targetCount);
}
