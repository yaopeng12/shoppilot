/**
 * 1688 sourcing helpers.
 *
 * 1688 blocks unauthenticated scraping frequently, so the reliable product
 * surface here is a ranked sourcing brief plus precise search links.
 */

import type { Product } from "@/lib/tiktok-adgen/types";
import type { PetCleaningScenario, SourceCandidate } from "./types";

type SourcingSeed = {
  title: string;
  price: number;
  unit: string;
  minOrder: number;
  supplier: string;
  supplierLocation: string;
  supplierRating: number;
  transactionCount: number;
  tags: string[];
  scenarios: PetCleaningScenario[];
  productTypes: string[];
  keywords: string[];
};

type SourceSignal = Pick<SourceCandidate, "productType" | "keywords"> &
  Partial<Pick<SourceCandidate, "suggestedRetailUsd" | "complianceRisk">>;

export type Ali1688Product = {
  id: string;
  title: string;
  price: number;
  priceRange: string;
  suggestedRetailUsd: number;
  grossMarginPercent: number;
  unit: string;
  minOrder: number;
  supplier: string;
  supplierLocation: string;
  supplierRating: number;
  transactionCount: number;
  imageUrl: string;
  productUrl: string;
  tags: string[];
  matchScore?: number;
  matchReasons?: string[];
  riskLevel: "low" | "medium" | "high";
  riskFlags: string[];
  sourcingTips: string[];
  searchKeywords: string[];
};

export type SearchOptions = {
  scenario?: PetCleaningScenario;
  productType?: string;
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "orders" | "rating";
  limit?: number;
};

const SCENARIO_SEARCH_KEYWORDS: Record<PetCleaningScenario, string[]> = {
  cat_litter_odor: ["猫砂除臭剂", "猫砂盆除味", "猫砂除臭颗粒", "宠物除臭喷雾"],
  cat_urine_cleanup: ["猫尿清洁剂", "宠物尿渍清洁剂", "生物酶除味剂", "猫尿去味喷雾"],
  litter_tracking: ["双层猫砂垫", "蜂窝猫砂垫", "猫砂防带出垫", "猫砂收集垫"],
  pet_hair_cleanup: ["宠物除毛器", "粘毛滚筒", "宠物毛发清理器", "沙发除毛刷"],
  fabric_odor: ["宠物织物除臭喷雾", "沙发除味剂", "宠物床除味喷雾", "布艺除臭剂"],
  dog_pad_floor: ["狗尿垫", "宠物尿垫", "宠物地板清洁剂", "狗狗厕所垫"],
  auto_litter_box: ["自动猫砂盆", "智能猫砂盆", "自清洁猫砂盆", "电动猫砂盆"],
  pet_bathing: ["宠物洗澡刷", "宠物沐浴露", "狗狗洗澡刷", "宠物吸水毛巾"],
  paw_cleanup: ["狗狗洗脚杯", "宠物脚掌清洁器", "遛狗洗脚器", "宠物湿巾"],
  pet_stain_removal: ["宠物地毯清洁剂", "宠物污渍去除剂", "地毯酶清洁剂", "沙发尿渍清洁剂"],
  aquarium_cleaning: ["鱼缸清洁刷", "鱼缸除藻器", "水族箱清洁工具", "鱼缸过滤棉"],
  pet_toys_cleaning: ["宠物玩具清洁剂", "宠物玩具消毒液", "宠物用品清洁湿巾", "玩具清洗液"],
};

const PRODUCT_TYPE_KEYWORDS: Record<string, string[]> = {
  "odor absorber": ["除臭剂", "除味剂", "异味消除"],
  "deodorizing spray": ["除臭喷雾", "去味喷雾", "宠物除味"],
  "litter additive": ["猫砂添加剂", "猫砂伴侣", "猫砂除臭颗粒"],
  "litter deodorizer": ["猫砂除臭剂", "猫砂除味", "猫砂除臭珠"],
  "enzyme cleaner": ["生物酶清洁剂", "酶解除味剂", "尿渍清洁剂"],
  "urine remover": ["尿渍清洁剂", "猫尿去味", "宠物尿渍去除"],
  "cat litter mat": ["猫砂垫", "双层猫砂垫", "蜂窝猫砂垫"],
  "litter catcher": ["猫砂收集垫", "防带出猫砂垫", "猫砂过滤垫"],
  "pet hair remover": ["宠物除毛器", "沙发除毛刷", "毛发清理器"],
  "lint roller": ["粘毛器", "粘毛滚筒", "衣物粘毛"],
  "fabric deodorizer": ["织物除臭喷雾", "布艺除味剂", "沙发除味"],
  "pet bed spray": ["宠物床除味", "宠物窝除臭", "宠物垫喷雾"],
  "floor cleaner": ["宠物地板清洁剂", "地面清洁剂", "尿渍地板清洁"],
  "training pad": ["宠物尿垫", "狗尿垫", "训导尿垫"],
  "automatic litter box": ["自动猫砂盆", "智能猫砂盆", "自清洁猫砂盆"],
  "self-cleaning litter box": ["自清洁猫砂盆", "电动猫砂盆", "智能猫厕所"],
  "pet shampoo": ["宠物沐浴露", "狗狗香波", "猫咪沐浴露"],
  "bath brush": ["宠物洗澡刷", "硅胶洗澡刷", "沐浴刷"],
  "grooming glove": ["宠物梳毛手套", "美容手套", "洗澡手套"],
  "paw cleaner": ["洗脚杯", "脚掌清洁器", "宠物洗脚器"],
  "paw cleaner cup": ["狗狗洗脚杯", "便携洗脚杯", "硅胶洗脚器"],
  "paw washer": ["洗脚器", "脚掌清洗杯", "宠物洗脚"],
  "pet wipes": ["宠物湿巾", "狗狗湿巾", "猫狗清洁湿巾"],
  "carpet cleaner": ["地毯清洁剂", "宠物地毯清洁", "尿渍地毯清洁"],
  "stain remover": ["污渍去除剂", "尿渍去除", "宠物去渍剂"],
  "toy cleaner": ["宠物玩具清洁剂", "玩具清洗液", "宠物用品清洁"],
  "pet sanitizer": ["宠物用品消毒", "玩具消毒液", "宠物清洁湿巾"],
  "algae scraper": ["鱼缸除藻器", "磁力鱼缸刷", "鱼缸清洁刷"],
  "aquarium vacuum": ["鱼缸吸污器", "水族箱吸污", "鱼缸换水器"],
  "drying towel": ["宠物吸水毛巾", "狗狗擦澡毛巾", "速干毛巾"],
  "vacuum attachment": ["宠物吸尘配件", "沙发除毛吸头", "毛发吸尘刷"],
};

const SOURCING_SEEDS: SourcingSeed[] = [
  {
    title: "猫砂盆除臭颗粒 长效除味猫砂伴侣",
    price: 6.8,
    unit: "瓶",
    minOrder: 2,
    supplier: "义乌宠物清洁用品厂",
    supplierLocation: "浙江",
    supplierRating: 4.7,
    transactionCount: 8600,
    tags: ["猫砂除臭", "猫砂伴侣", "低客单"],
    scenarios: ["cat_litter_odor"],
    productTypes: ["litter deodorizer", "litter additive", "odor absorber"],
    keywords: ["cat litter", "litter box", "deodorizer", "odor", "beads", "猫砂", "除臭", "除味"],
  },
  {
    title: "宠物除臭喷雾 猫砂盆猫窝通用除味剂",
    price: 9.6,
    unit: "瓶",
    minOrder: 2,
    supplier: "广州宠物护理工厂",
    supplierLocation: "广东",
    supplierRating: 4.6,
    transactionCount: 7200,
    tags: ["除臭喷雾", "猫窝", "日常清洁"],
    scenarios: ["cat_litter_odor", "fabric_odor"],
    productTypes: ["deodorizing spray", "fabric deodorizer", "pet bed spray"],
    keywords: ["deodorizing spray", "odor spray", "pet bed", "fabric", "room", "除臭喷雾", "宠物除味"],
  },
  {
    title: "生物酶宠物尿渍清洁剂 猫尿狗尿去味喷雾",
    price: 13.8,
    unit: "瓶",
    minOrder: 2,
    supplier: "上海清洁用品源头厂",
    supplierLocation: "上海",
    supplierRating: 4.8,
    transactionCount: 9800,
    tags: ["生物酶", "尿渍清洁", "去味"],
    scenarios: ["cat_urine_cleanup", "pet_stain_removal"],
    productTypes: ["enzyme cleaner", "urine remover", "carpet cleaner", "stain remover"],
    keywords: ["urine", "cat urine", "enzyme", "stain", "carpet", "accident", "生物酶", "尿渍"],
  },
  {
    title: "双层蜂窝猫砂垫 防带出可水洗猫砂收集垫",
    price: 18.5,
    unit: "张",
    minOrder: 2,
    supplier: "宁波宠物垫源头工厂",
    supplierLocation: "浙江",
    supplierRating: 4.7,
    transactionCount: 11200,
    tags: ["双层蜂窝", "防带出", "可水洗"],
    scenarios: ["litter_tracking"],
    productTypes: ["cat litter mat", "litter catcher"],
    keywords: ["litter mat", "tracking", "honeycomb", "floor", "catcher", "猫砂垫", "防带出"],
  },
  {
    title: "可重复使用宠物除毛器 沙发衣物毛发清理刷",
    price: 8.9,
    unit: "个",
    minOrder: 3,
    supplier: "义乌家居清洁用品厂",
    supplierLocation: "浙江",
    supplierRating: 4.6,
    transactionCount: 15800,
    tags: ["除毛器", "沙发衣物", "可重复使用"],
    scenarios: ["pet_hair_cleanup"],
    productTypes: ["pet hair remover", "lint roller"],
    keywords: ["pet hair", "fur", "sofa", "clothes", "lint", "brush", "reusable", "除毛"],
  },
  {
    title: "宠物织物除臭喷雾 沙发宠物床布艺去味",
    price: 10.5,
    unit: "瓶",
    minOrder: 2,
    supplier: "杭州家居清洁工厂",
    supplierLocation: "浙江",
    supplierRating: 4.5,
    transactionCount: 6400,
    tags: ["织物除臭", "沙发", "宠物床"],
    scenarios: ["fabric_odor"],
    productTypes: ["fabric deodorizer", "pet bed spray", "deodorizing spray"],
    keywords: ["fabric", "sofa", "pet bed", "couch", "odor", "home", "织物", "沙发除味"],
  },
  {
    title: "加厚狗尿垫 宠物训导尿垫吸水防漏",
    price: 12.5,
    unit: "包",
    minOrder: 2,
    supplier: "杭州宠物纸品厂",
    supplierLocation: "浙江",
    supplierRating: 4.6,
    transactionCount: 13600,
    tags: ["尿垫", "吸水防漏", "训导"],
    scenarios: ["dog_pad_floor"],
    productTypes: ["training pad"],
    keywords: ["dog pad", "puppy pad", "pee pad", "training", "floor", "狗尿垫", "宠物尿垫"],
  },
  {
    title: "宠物地板清洁除味喷雾 狗尿区域清洁剂",
    price: 11.2,
    unit: "瓶",
    minOrder: 2,
    supplier: "广州宠物清洁用品有限公司",
    supplierLocation: "广东",
    supplierRating: 4.5,
    transactionCount: 6900,
    tags: ["地板清洁", "狗尿除味", "喷雾"],
    scenarios: ["dog_pad_floor", "pet_stain_removal"],
    productTypes: ["floor cleaner", "deodorizing spray"],
    keywords: ["floor", "cleaner", "dog", "urine", "odor", "spray", "地板清洁"],
  },
  {
    title: "智能自清洁猫砂盆 APP控制全自动猫厕所",
    price: 289,
    unit: "台",
    minOrder: 1,
    supplier: "深圳智能宠物科技工厂",
    supplierLocation: "广东",
    supplierRating: 4.6,
    transactionCount: 3200,
    tags: ["自动猫砂盆", "智能", "高客单"],
    scenarios: ["auto_litter_box"],
    productTypes: ["automatic litter box", "self-cleaning litter box"],
    keywords: ["automatic", "self-cleaning", "smart", "litter box", "app", "自动猫砂盆"],
  },
  {
    title: "硅胶宠物洗澡刷 沐浴起泡猫狗通用",
    price: 8.5,
    unit: "个",
    minOrder: 3,
    supplier: "义乌宠物刷具厂",
    supplierLocation: "浙江",
    supplierRating: 4.5,
    transactionCount: 9100,
    tags: ["洗澡刷", "硅胶", "猫狗通用"],
    scenarios: ["pet_bathing"],
    productTypes: ["bath brush", "grooming glove"],
    keywords: ["bath", "brush", "shampoo", "grooming", "silicone", "洗澡刷"],
  },
  {
    title: "宠物沐浴露 狗狗猫咪香波滋润护毛",
    price: 15.2,
    unit: "瓶",
    minOrder: 2,
    supplier: "广州宠物护理用品厂",
    supplierLocation: "广东",
    supplierRating: 4.6,
    transactionCount: 7600,
    tags: ["沐浴露", "香波", "护毛"],
    scenarios: ["pet_bathing"],
    productTypes: ["pet shampoo"],
    keywords: ["shampoo", "bath", "grooming", "dog", "cat", "宠物沐浴露"],
  },
  {
    title: "便携狗狗洗脚杯 硅胶刷头宠物脚掌清洁器",
    price: 12.5,
    unit: "个",
    minOrder: 2,
    supplier: "深圳宠物用品工厂",
    supplierLocation: "广东",
    supplierRating: 4.7,
    transactionCount: 10400,
    tags: ["洗脚杯", "脚掌清洁", "遛狗"],
    scenarios: ["paw_cleanup"],
    productTypes: ["paw cleaner", "paw cleaner cup", "paw washer"],
    keywords: ["paw", "muddy", "washer", "cleaner cup", "walk", "silicone", "洗脚杯"],
  },
  {
    title: "宠物清洁湿巾 猫狗通用脚掌身体擦拭",
    price: 6.5,
    unit: "包",
    minOrder: 5,
    supplier: "杭州纸品湿巾厂",
    supplierLocation: "浙江",
    supplierRating: 4.4,
    transactionCount: 18200,
    tags: ["湿巾", "猫狗通用", "便携"],
    scenarios: ["paw_cleanup", "pet_toys_cleaning"],
    productTypes: ["pet wipes"],
    keywords: ["pet wipes", "paw", "clean", "portable", "wet wipes", "宠物湿巾"],
  },
  {
    title: "磁力鱼缸除藻刷 水族箱玻璃清洁工具",
    price: 18.9,
    unit: "个",
    minOrder: 2,
    supplier: "义乌水族用品厂",
    supplierLocation: "浙江",
    supplierRating: 4.5,
    transactionCount: 4800,
    tags: ["鱼缸清洁", "磁力刷", "除藻"],
    scenarios: ["aquarium_cleaning"],
    productTypes: ["algae scraper"],
    keywords: ["aquarium", "fish tank", "algae", "scraper", "magnetic", "鱼缸"],
  },
  {
    title: "宠物玩具用品清洁喷雾 玩具清洗除味",
    price: 9.2,
    unit: "瓶",
    minOrder: 2,
    supplier: "上海宠物护理用品厂",
    supplierLocation: "上海",
    supplierRating: 4.3,
    transactionCount: 4100,
    tags: ["玩具清洁", "宠物用品", "除味"],
    scenarios: ["pet_toys_cleaning"],
    productTypes: ["toy cleaner", "pet sanitizer"],
    keywords: ["toy", "cleaner", "spray", "hygiene", "pet toy", "玩具清洁"],
  },
];

function normalizeText(value?: string) {
  return (value || "").toLowerCase();
}

function productText(product?: Product, note?: string, productType?: string) {
  return [
    product?.title,
    product?.description,
    product?.tags?.join(" "),
    note,
    productType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
}

function hitScore(text: string, keywords: string[]) {
  const normalized = keywords.map(normalizeText).filter(Boolean);
  const hits = normalized.filter((keyword) => text.includes(keyword)).length;
  return Math.min(1, hits / Math.max(1, Math.min(5, normalized.length)));
}

function build1688SearchUrl(query: string, options: Pick<SearchOptions, "minPrice" | "maxPrice" | "sortBy"> = {}) {
  const params = new URLSearchParams({ keywords: query });
  if (options.minPrice) params.set("priceStart", String(options.minPrice));
  if (options.maxPrice) params.set("priceEnd", String(options.maxPrice));
  if (options.sortBy === "price") params.set("sortType", "price");
  if (options.sortBy === "orders") params.set("sortType", "va");
  if (options.sortBy === "rating") params.set("sortType", "va_r");
  return `https://s.1688.com/selloffer/offer_search.htm?${params.toString()}`;
}

function getProductTypeKeywords(productType?: string): string[] {
  if (!productType) return [];
  const normalized = productType.toLowerCase();
  const exact = PRODUCT_TYPE_KEYWORDS[normalized];
  if (exact) return exact;

  const matched = Object.entries(PRODUCT_TYPE_KEYWORDS).find(([key]) => normalized.includes(key) || key.includes(normalized));
  return matched?.[1] || [];
}

function getSearchKeywords(options: SearchOptions): string[] {
  const scenarioKeywords = options.scenario ? SCENARIO_SEARCH_KEYWORDS[options.scenario] || [] : [];
  const typeKeywords = getProductTypeKeywords(options.productType);
  const customKeywords = options.keywords || [];

  return [...new Set([...typeKeywords.slice(0, 2), ...scenarioKeywords.slice(0, 2), ...customKeywords])].slice(0, 5);
}

function scoreSeed(
  seed: SourcingSeed,
  options: {
    scenario: PetCleaningScenario;
    source?: SourceSignal;
    product?: Product;
    note?: string;
  },
) {
  const text = productText(options.product, options.note, options.source?.productType);
  const sourceKeywords = options.source?.keywords || [];
  const scenarioMatch = seed.scenarios.includes(options.scenario) ? 1 : 0;
  const typeMatch = options.source ? hitScore(seed.productTypes.join(" "), [options.source.productType]) : 0;
  const seedKeywordMatch = hitScore(text, seed.keywords);
  const sourceKeywordMatch = sourceKeywords.length ? hitScore(seed.keywords.join(" "), sourceKeywords) : 0;
  const titleMatch = hitScore(text, seed.title.split(/[ ,，、]+/).filter(Boolean));
  const supplierScore = seed.supplierRating / 5;
  const transactionScore = Math.min(1, seed.transactionCount / 12000);

  const score = clampScore(
    scenarioMatch * 30 +
      typeMatch * 22 +
      seedKeywordMatch * 20 +
      sourceKeywordMatch * 12 +
      titleMatch * 8 +
      supplierScore * 4 +
      transactionScore * 4,
  );

  const reasons: string[] = [];
  if (scenarioMatch) reasons.push("matches detected scenario");
  if (typeMatch > 0) reasons.push("matches selected source type");
  if (seedKeywordMatch > 0 || sourceKeywordMatch > 0) reasons.push("matches product keywords");
  if (seed.transactionCount >= 8000) reasons.push("strong transaction signal");
  if (seed.supplierRating >= 4.6) reasons.push("high supplier rating");

  return { score, reasons };
}

function estimateSuggestedRetailUsd(seed: SourcingSeed, source?: Partial<Pick<SourceCandidate, "suggestedRetailUsd">>) {
  if (source?.suggestedRetailUsd) return source.suggestedRetailUsd;
  const cnyToUsd = seed.price / 7.2;
  return Math.round(Math.max(9.99, cnyToUsd * 3.2) * 100) / 100;
}

function getRiskFlags(seed: SourcingSeed, source?: Partial<Pick<SourceCandidate, "complianceRisk">>) {
  const flags: string[] = [];
  if (source?.complianceRisk === "medium") flags.push("check claim wording before publishing");
  if (seed.supplierRating < 4.5) flags.push("supplier rating needs manual review");
  if (seed.transactionCount < 5000) flags.push("transaction signal is still limited");
  if (seed.price > 80) flags.push("higher ticket item; validate shipping and return policy");
  return flags;
}

function getRiskLevel(flags: string[]) {
  if (flags.length >= 3) return "high" as const;
  if (flags.length >= 1) return "medium" as const;
  return "low" as const;
}

function getSourcingTips(seed: SourcingSeed, reasons: string[]) {
  const tips = [
    `Search with "${seed.tags[0]}" first, then compare top factories by recent transactions.`,
    "Ask supplier for real product demo clips or close-up material photos before ordering samples.",
  ];
  if (reasons.includes("matches product keywords")) tips.push("Keep this as the primary sample because it matches the input product signal.");
  if (seed.minOrder <= 2) tips.push("Low MOQ makes it suitable for first test orders.");
  return tips.slice(0, 4);
}

function toAliProduct(
  seed: SourcingSeed,
  index: number,
  score: number,
  reasons: string[],
  source?: Partial<Pick<SourceCandidate, "suggestedRetailUsd" | "complianceRisk">>,
): Ali1688Product {
  const searchKeywords = [...new Set([seed.tags[0], seed.title, ...seed.tags.slice(1, 3)])].filter(Boolean);
  const keyword = searchKeywords.slice(0, 3).join(" ");
  const suggestedRetailUsd = estimateSuggestedRetailUsd(seed, source);
  const landedCostUsd = seed.price / 7.2;
  const grossMarginPercent = clampScore(((suggestedRetailUsd - landedCostUsd) / Math.max(1, suggestedRetailUsd)) * 100);
  const riskFlags = getRiskFlags(seed, source);
  return {
    id: `sourcing_${seed.scenarios[0]}_${index}`,
    title: seed.title,
    price: seed.price,
    priceRange: `${seed.price}-${Math.round(seed.price * 1.25 * 10) / 10}`,
    suggestedRetailUsd,
    grossMarginPercent,
    unit: seed.unit,
    minOrder: seed.minOrder,
    supplier: seed.supplier,
    supplierLocation: seed.supplierLocation,
    supplierRating: seed.supplierRating,
    transactionCount: seed.transactionCount,
    imageUrl: `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(seed.tags[0] || "1688")}`,
    productUrl: build1688SearchUrl(keyword, { sortBy: "orders" }),
    tags: seed.tags,
    matchScore: score,
    matchReasons: reasons,
    riskLevel: getRiskLevel(riskFlags),
    riskFlags,
    sourcingTips: getSourcingTips(seed, reasons),
    searchKeywords,
  };
}

export function generate1688SearchUrl(options: SearchOptions): string {
  const keywords = getSearchKeywords(options);
  return build1688SearchUrl(keywords.join(" "), options);
}

export function generate1688SearchUrls(
  scenario: PetCleaningScenario,
  source?: SourceSignal,
  product?: Product,
  note?: string,
): { keyword: string; url: string }[] {
  const directKeywords = getSearchKeywords({
    scenario,
    productType: source?.productType,
    keywords: source?.keywords.slice(0, 2),
  });
  const text = productText(product, note, source?.productType);
  const seedKeywords = SOURCING_SEEDS
    .filter((seed) => seed.scenarios.includes(scenario) || includesAny(seed.keywords.join(" "), source?.keywords || []))
    .sort((a, b) => scoreSeed(b, { scenario, source, product, note }).score - scoreSeed(a, { scenario, source, product, note }).score)
    .flatMap((seed) => seed.tags.slice(0, 1));
  const productHints = text
    .split(/\s+/)
    .filter((word) => word.length > 3 && !word.startsWith("http"))
    .slice(0, 2);
  const keywords = [...new Set([...directKeywords, ...seedKeywords, ...productHints])].slice(0, 6);

  return keywords.map((keyword) => ({
    keyword,
    url: build1688SearchUrl(keyword, { sortBy: "orders" }),
  }));
}

export async function search1688Products(options: SearchOptions): Promise<Ali1688Product[]> {
  const url = generate1688SearchUrl(options);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) return [];
    return [];
  } catch {
    return [];
  }
}

export function generateMock1688Products(
  scenario: PetCleaningScenario,
  count = 5,
  options: {
    product?: Product;
    source?: SourceSignal;
    note?: string;
  } = {},
): Ali1688Product[] {
  const ranked = SOURCING_SEEDS
    .map((seed, index) => {
      const { score, reasons } = scoreSeed(seed, { scenario, source: options.source, product: options.product, note: options.note });
      return { seed, index, score, reasons };
    })
    .filter(({ seed, score }) => seed.scenarios.includes(scenario) || score >= 35)
    .sort((a, b) => b.score - a.score || b.seed.transactionCount - a.seed.transactionCount)
    .slice(0, count);

  return ranked.map(({ seed, index, score, reasons }) => toAliProduct(seed, index, score, reasons, options.source));
}

export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

export function formatTransactions(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}千`;
  return String(count);
}
