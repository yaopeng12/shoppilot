export const TARGET_MARKET_CODES = [
  "en-US",
  "en-GB",
  "th",
  "id",
  "vi",
  "ms",
  "ja",
  "es",
  "pt-BR",
] as const;

export type TargetMarketCode = (typeof TARGET_MARKET_CODES)[number];

export type MarketProfile = {
  code: TargetMarketCode;
  label: string;
  zhLabel: string;
  language: string;
  nativeLanguage: string;
  targetMarket: string;
  localizationLevel: string;
  tone: string;
  culturalNotes: string[];
  forbidden: string[];
  creatorVoiceReference: string;
};

export type LocalizedTemplateSignal = {
  opener: string;
  secondaryHook: string;
  productReveal: string;
  proofLine: string;
  cta: string;
  captions: string[];
  voiceover: string;
  tone: string;
  culturalNote: string;
  hashtags: string[];
};

export type LocalizedAdPackFallback = {
  categoryLabel: string;
  template: {
    name: string;
    format: string;
    structure: string[];
    riskNotes: string[];
  };
  source: {
    title: string;
    productType: string;
    reasons: string[];
  };
  strategy: {
    positioning: string;
    targetAudience: string;
    corePainPoint: string;
    productPromise: string;
    proofAngle: string;
    offerAngle: string;
  };
  scriptNames: {
    sprint: string;
    proof: string;
  };
  sceneObjectives: string[];
  sceneVisuals: string[];
  shotList: string[];
  aiVideoPrompts: string[];
  compliance: {
    safeClaims: string[];
    avoidClaims: string[];
    saferPhrases: string[];
  };
  testingPlan: Array<{
    variant: string;
    change: string;
    successMetric: string;
  }>;
};

type SignalInput = {
  productName?: string;
  painPoint?: string;
  productCategory?: string;
  useScene?: string;
};

export const DEFAULT_TARGET_MARKET: TargetMarketCode = "en-US";

export const TARGET_MARKET_PROFILES: Record<TargetMarketCode, MarketProfile> = {
  "en-US": {
    code: "en-US",
    label: "English (US)",
    zhLabel: "美国英语",
    language: "English (US)",
    nativeLanguage: "English",
    targetMarket: "United States",
    localizationLevel: "Conversational + Gen-Z TikTok slang",
    tone: "fast, emotional, creator-first, punchy, a little dramatic but still believable",
    culturalNotes: [
      "Use first-person creator phrasing, not polished brand copy.",
      "Lean into small apartment, guest-coming-over, and pet-parent embarrassment moments.",
      "Use light slang only when it sounds natural: okay, actually, low-key, not gonna lie, where has this been.",
    ],
    forbidden: ["translationese", "corporate ad voice", "hard-sell infomercial language", "unsupported miracle claims"],
    creatorVoiceReference: "like a US TikTok creator casually sharing a useful pet-home find",
  },
  "en-GB": {
    code: "en-GB",
    label: "English (UK)",
    zhLabel: "英国英语",
    language: "English (UK)",
    nativeLanguage: "English",
    targetMarket: "United Kingdom",
    localizationLevel: "British everyday expression",
    tone: "understated, practical, dry-humour friendly, less hype than US copy",
    culturalNotes: [
      "Use British wording such as flat, bin, bits, proper, sorted, works a treat when appropriate.",
      "Avoid over-the-top hype; make the creator sound calmly impressed.",
      "Frame pet odour and mess as a tidy-home routine problem.",
    ],
    forbidden: ["American spelling when avoidable", "excessive hype", "formal brochure copy", "unsupported absolute claims"],
    creatorVoiceReference: "like a UK pet owner on TikTok showing a practical home-cleaning fix",
  },
  th: {
    code: "th",
    label: "Thai",
    zhLabel: "泰语",
    language: "Thai",
    nativeLanguage: "ไทย",
    targetMarket: "Thailand",
    localizationLevel: "Thai casual speech + internet language",
    tone: "friendly, expressive, playful, peer recommendation style",
    culturalNotes: [
      "Use Thai social commerce phrasing that feels like a friend recommending a find.",
      "Natural particles and casual words are welcome when appropriate.",
      "Make the pain point emotional and relatable, then keep the proof simple.",
    ],
    forbidden: ["literal Chinese-to-Thai translation", "stiff formal Thai", "over-claiming safety or odor removal"],
    creatorVoiceReference: "like a Thai TikTok creator telling friends about a pet-home cleaning item",
  },
  id: {
    code: "id",
    label: "Indonesian",
    zhLabel: "印尼语",
    language: "Indonesian",
    nativeLanguage: "Bahasa Indonesia",
    targetMarket: "Indonesia",
    localizationLevel: "Casual Indonesian",
    tone: "warm, practical, chatty, everyday home-life creator style",
    culturalNotes: [
      "Use natural Indonesian social commerce wording such as jujur, kepake banget, rumah, bulu, bau.",
      "Keep claims grounded and demo-led.",
      "Make the product feel like a small routine upgrade, not a luxury gadget.",
    ],
    forbidden: ["formal textbook Indonesian", "literal translation", "medical or guaranteed odor-removal claims"],
    creatorVoiceReference: "like an Indonesian TikTok creator sharing a useful pet-cleaning find at home",
  },
  vi: {
    code: "vi",
    label: "Vietnamese",
    zhLabel: "越南语",
    language: "Vietnamese",
    nativeLanguage: "Tiếng Việt",
    targetMarket: "Vietnam",
    localizationLevel: "Vietnamese casual speech",
    tone: "direct, helpful, friendly, demo-led",
    culturalNotes: [
      "Use natural Vietnamese creator phrasing with relatable home-cleaning pain.",
      "Keep the line short and spoken, not written like a catalog.",
      "Use proof moments around smell, fur, litter, and daily cleaning routine.",
    ],
    forbidden: ["stiff formal Vietnamese", "literal translation", "unsupported health or sterilization claims"],
    creatorVoiceReference: "like a Vietnamese TikTok seller explaining a practical pet-home cleaning item",
  },
  ms: {
    code: "ms",
    label: "Malay",
    zhLabel: "马来语",
    language: "Malay",
    nativeLanguage: "Bahasa Melayu",
    targetMarket: "Malaysia",
    localizationLevel: "Casual Malay",
    tone: "friendly, simple, conversational, practical",
    culturalNotes: [
      "Use everyday Malay phrasing such as rumah, bau, senang, berbaloi when natural.",
      "Keep it modest and useful instead of overly aggressive.",
      "Focus on family-home cleanliness and quick routine reset.",
    ],
    forbidden: ["formal government-style Malay", "literal translation", "guaranteed permanent odor claims"],
    creatorVoiceReference: "like a Malaysian TikTok creator sharing an affordable pet-cleaning helper",
  },
  ja: {
    code: "ja",
    label: "Japanese",
    zhLabel: "日语",
    language: "Japanese",
    nativeLanguage: "日本語",
    targetMarket: "Japan",
    localizationLevel: "Auto-select polite/plain register",
    tone: "trust-building, concise, routine-oriented, detail-aware",
    culturalNotes: [
      "Use polite form for product explanation and plain casual form for UGC diary-style lines.",
      "Avoid loud hype; emphasize daily routine, cleanliness, smell concern, and small relief.",
      "Make the creator sound specific and observant, not pushy.",
    ],
    forbidden: ["machine-translated Japanese", "overly direct pressure", "unsupported safety, deodorizing, or antibacterial claims"],
    creatorVoiceReference: "like a Japanese creator showing a useful pet-cleaning routine item",
  },
  es: {
    code: "es",
    label: "Spanish",
    zhLabel: "拉美西语",
    language: "Latin American Spanish",
    nativeLanguage: "Español LATAM",
    targetMarket: "Mexico / Latin America",
    localizationLevel: "Latin American Spanish",
    tone: "expressive, warm, practical, social-commerce friendly",
    culturalNotes: [
      "Use LATAM wording, not Spain-specific phrasing.",
      "Make it feel like a pet owner recommending something useful to friends.",
      "Lean into home smell, visits, quick cleaning, and daily convenience.",
    ],
    forbidden: ["Castilian-only phrasing", "literal translation", "medical or guaranteed cleaning claims"],
    creatorVoiceReference: "like a LATAM TikTok creator sharing a pet-home cleaning product that actually helps",
  },
  "pt-BR": {
    code: "pt-BR",
    label: "Portuguese (BR)",
    zhLabel: "巴葡",
    language: "Brazilian Portuguese",
    nativeLanguage: "Português do Brasil",
    targetMarket: "Brazil",
    localizationLevel: "Brazilian Portuguese casual speech",
    tone: "expressive, friendly, practical, creator-led",
    culturalNotes: [
      "Use Brazilian Portuguese, not European Portuguese.",
      "Natural words like gente, sério, casa, cheiro, pelo, vale muito can fit when appropriate.",
      "Keep it demo-led and emotionally relatable.",
    ],
    forbidden: ["European Portuguese wording", "literal translation", "miracle odor or disinfectant claims"],
    creatorVoiceReference: "like a Brazilian TikTok creator showing a pet-home cleaning find",
  },
};

const LEGACY_MARKET_MAP: Record<string, TargetMarketCode> = {
  us: "en-US",
  uk: "en-GB",
  jp: "ja",
  global: "en-US",
};

export function isTargetMarketCode(value: string): value is TargetMarketCode {
  return TARGET_MARKET_CODES.includes(value as TargetMarketCode);
}

export function normalizeTargetMarket(value?: string | null): TargetMarketCode {
  if (!value) return DEFAULT_TARGET_MARKET;
  if (isTargetMarketCode(value)) return value;
  return LEGACY_MARKET_MAP[value] || DEFAULT_TARGET_MARKET;
}

export function getMarketProfile(value?: string | null): MarketProfile {
  return TARGET_MARKET_PROFILES[normalizeTargetMarket(value)];
}

export function getMarketOptions(locale: "en" | "zh" = "en") {
  return TARGET_MARKET_CODES.map((code) => {
    const profile = TARGET_MARKET_PROFILES[code];
    return {
      code,
      label: locale === "zh" ? profile.zhLabel : profile.label,
      detail: `${profile.code} · ${profile.targetMarket}`,
      language: profile.nativeLanguage,
    };
  });
}

export function buildLocalizationPrompt(value?: string | null) {
  const profile = getMarketProfile(value);

  return `Target market localization:
- Market code: ${profile.code}
- Target market: ${profile.targetMarket}
- Language: ${profile.language} (${profile.nativeLanguage})
- Localization level: ${profile.localizationLevel}
- Creator voice: ${profile.creatorVoiceReference}
- Tone: ${profile.tone}
- Cultural notes: ${profile.culturalNotes.join(" | ")}
- Forbidden: ${profile.forbidden.join(" | ")}

This is not translation. Adapt the script like a native young TikTok creator in ${profile.targetMarket}.
Avoid translationese, formal written language, and generic ad copy.
Use local expressions only when they sound natural.
Keep every product claim grounded in visible demo evidence.`;
}

export function getLocalizedTemplateSignal(input: SignalInput, value?: string | null): LocalizedTemplateSignal {
  const profile = getMarketProfile(value);
  const product = input.productName || defaultProductTerm(profile.code);
  const pain = localTerm(profile.code, "pain", input.painPoint || "pet_home_mess");
  const scene = localTerm(profile.code, "scene", input.useScene || "pet_area");

  switch (profile.code) {
    case "en-GB":
      return {
        opener: `If your flat has a pet, this is the bit that needs sorting.`,
        secondaryHook: `Not glamorous, but honestly, this makes the ${scene} feel so much easier to keep on top of.`,
        productReveal: `I tried ${product} for the ${pain} problem.`,
        proofLine: "The useful part is the quick reset you can actually see on camera.",
        cta: "Have a look and see if it fits your routine.",
        captions: ["Pet area reset", "A proper little clean-up helper", "No faff, just a clearer routine"],
        voiceover: `If you have pets, you know the house can look tidy and still have that one annoying spot. I tried ${product} for ${pain}, and the point is not a dramatic miracle. It is a quick little reset that makes the ${scene} easier to keep under control.`,
        tone: profile.tone,
        culturalNote: "Use understated British phrasing and practical proof instead of big hype.",
        hashtags: ["#PetTokUK", "#PetCleaning", "#CleanHome"],
      };
    case "th":
      return {
        opener: "บ้านไหนเลี้ยงน้องแล้วมีกลิ่นตรงมุมนี้ ต้องดูอันนี้เลย",
        secondaryHook: `ตัวนี้ช่วยให้มุม ${scene} จัดการง่ายขึ้นแบบเห็นภาพ`,
        productReveal: `ลองใช้ ${product} กับปัญหา ${pain}`,
        proofLine: "โชว์ตอนใช้จริงให้เห็นเลย ไม่ต้องพูดเวอร์",
        cta: "ลองดูว่าเข้ากับบ้านเราไหม",
        captions: ["มุมสัตว์เลี้ยงต้องรอด", "ใช้จริงในบ้านจริง", "เก็บกลิ่น เก็บความรกให้ง่ายขึ้น"],
        voiceover: `ใครเลี้ยงน้องจะเข้าใจเลยว่าบ้านดูสะอาด แต่บางมุมยังมีกลิ่นหรือคราบกวนใจ เราลองใช้ ${product} กับปัญหา ${pain} แล้วชอบตรงที่มันทำให้การเก็บมุมนี้ง่ายขึ้น ใช้เป็นรูทีนได้จริงในบ้าน`,
        tone: profile.tone,
        culturalNote: "Use Thai peer-recommendation tone with casual particles, not formal sales language.",
        hashtags: ["#ทาสแมว", "#ของใช้สัตว์เลี้ยง", "#บ้านสะอาด"],
      };
    case "id":
      return {
        opener: "Jujur, kalau punya peliharaan di rumah, bagian ini wajib dicek.",
        secondaryHook: `Ini kepake banget buat masalah ${pain} di area ${scene}.`,
        productReveal: `Aku coba ${product} buat rutinitas bersih-bersih hewan di rumah.`,
        proofLine: "Yang penting keliatan pas dipakai, bukan cuma klaim doang.",
        cta: "Cek dulu, siapa tahu cocok buat rumah kamu.",
        captions: ["Area pet jadi lebih gampang diurus", "Bersih-bersih harian tanpa drama", "Dipakai di rumah beneran"],
        voiceover: `Kalau punya hewan di rumah, kadang yang bikin capek bukan cuma berantakan, tapi bau dan sisa kotoran kecil yang muncul terus. Aku coba ${product} buat masalah ${pain}, dan ini lebih ke alat bantu rutinitas harian yang bikin area ${scene} lebih gampang diberesin.`,
        tone: profile.tone,
        culturalNote: "Use casual Indonesian with jujur/kepake banget style, while keeping claims grounded.",
        hashtags: ["#PetTokIndonesia", "#RumahBersih", "#ProdukHewan"],
      };
    case "vi":
      return {
        opener: "Nhà có thú cưng thì góc này phải kiểm tra đầu tiên.",
        secondaryHook: `Mình dùng thử ${product} cho vấn đề ${pain} ở khu ${scene}.`,
        productReveal: `Đây là cách mình thêm ${product} vào routine dọn dẹp.`,
        proofLine: "Cứ quay lúc dùng thật là dễ hiểu nhất.",
        cta: "Xem thử có hợp với nhà bạn không nha.",
        captions: ["Góc thú cưng gọn hơn", "Dọn nhanh mỗi ngày", "Không nói quá, cứ xem lúc dùng"],
        voiceover: `Nhà có thú cưng thì nhiều khi nhìn vẫn sạch, nhưng một góc nhỏ lại có mùi hoặc lông làm mình hơi ngại. Mình thử ${product} cho vấn đề ${pain}. Điểm mình thích là nó dễ đưa vào routine dọn dẹp hằng ngày và quay demo cũng rất rõ.`,
        tone: profile.tone,
        culturalNote: "Use short Vietnamese spoken lines and visible demo proof.",
        hashtags: ["#ThuCung", "#NhaSach", "#MeoHay"],
      };
    case "ms":
      return {
        opener: "Kalau rumah ada haiwan, bahagian ni memang kena tengok dulu.",
        secondaryHook: `${product} ni senang masuk dalam rutin bersihkan ${scene}.`,
        productReveal: `Saya cuba untuk masalah ${pain}.`,
        proofLine: "Tunjuk cara guna sebenar, baru nampak berbaloi atau tidak.",
        cta: "Tengok dulu kalau sesuai dengan rumah anda.",
        captions: ["Rutin rumah haiwan", "Bersihkan tanpa susah sangat", "Demo sebenar, bukan cakap kosong"],
        voiceover: `Bila ada haiwan di rumah, kadang-kadang tempat nampak kemas tapi masih ada bau atau kotoran kecil. Saya cuba ${product} untuk masalah ${pain}, dan yang menarik ialah ia mudah digunakan dalam rutin harian untuk kawasan ${scene}.`,
        tone: profile.tone,
        culturalNote: "Use casual Malaysian Malay and modest practical framing.",
        hashtags: ["#HaiwanPeliharaan", "#RumahBersih", "#PetCareMalaysia"],
      };
    case "ja":
      return {
        opener: "ペットがいる家で、意外と気になるのがこの場所です。",
        secondaryHook: `${scene}の${pain}対策として、${product}を試してみました。`,
        productReveal: "派手な変化というより、毎日の片づけが少しラクになる感じです。",
        proofLine: "実際に使っているところを見せるのが一番伝わります。",
        cta: "今の掃除ルーティンと比べてみてください。",
        captions: ["ペットまわりの小さなリセット", "毎日の掃除を少しラクに", "使い方が見えるから分かりやすい"],
        voiceover: `ペットがいると、部屋は片づいて見えても、においや毛、細かい汚れが気になる場所があります。今回は${pain}対策として${product}を使ってみました。大げさな表現ではなく、毎日の掃除ルーティンに入れやすいかを見せるのがポイントです。`,
        tone: profile.tone,
        culturalNote: "Use polite explanatory Japanese for product proof; switch to softer casual phrasing for diary-style hooks.",
        hashtags: ["#ペットのいる暮らし", "#猫のいる生活", "#掃除グッズ"],
      };
    case "es":
      return {
        opener: "Si tienes mascota en casa, este rincón es el primero que tienes que revisar.",
        secondaryHook: `Probé ${product} para el problema de ${pain} y sí ayuda en la rutina.`,
        productReveal: "No es magia, es un paso rápido que se entiende cuando lo ves.",
        proofLine: "Lo mejor es mostrarlo en uso real, sin prometer de más.",
        cta: "Revísalo y compáralo con tu rutina actual.",
        captions: ["Casa con mascotas, rutina real", "Ese rincón ya no se ignora", "Demo rápido y sin exagerar"],
        voiceover: `Si tienes mascotas, sabes que la casa puede verse limpia pero todavía hay un rincón con olor, pelo o arena. Probé ${product} para el problema de ${pain}, y la idea es usarlo como un paso simple dentro de la limpieza diaria, sobre todo en el área de ${scene}.`,
        tone: profile.tone,
        culturalNote: "Use LATAM Spanish, warm recommendation energy, and avoid Spain-only phrasing.",
        hashtags: ["#Mascotas", "#CasaLimpia", "#PetTok"],
      };
    case "pt-BR":
      return {
        opener: "Gente, quem tem pet em casa precisa olhar esse cantinho aqui.",
        secondaryHook: `Testei ${product} pra lidar com ${pain} e faz sentido na rotina.`,
        productReveal: "Não é promessa milagrosa; é aquele passo simples que ajuda no dia a dia.",
        proofLine: "Mostra usando de verdade, que aí dá pra entender o valor.",
        cta: "Dá uma olhada e vê se combina com a sua casa.",
        captions: ["Casa com pet, rotina real", "O cantinho que entrega o cheiro", "Demo simples, sem exagero"],
        voiceover: `Quem tem pet sabe: às vezes a casa parece limpa, mas ainda tem um cantinho com cheiro, pelo ou sujeirinha acumulando. Eu testei ${product} pra ${pain}, e o ponto é encaixar isso na rotina do dia a dia, principalmente na área de ${scene}.`,
        tone: profile.tone,
        culturalNote: "Use Brazilian Portuguese with expressive creator phrasing, not European Portuguese.",
        hashtags: ["#PetBrasil", "#CasaLimpa", "#Achadinhos"],
      };
    case "en-US":
    default:
      return {
        opener: `Okay, if your home has pets, this is the spot I would check first.`,
        secondaryHook: `Not gonna lie, ${product} makes the ${pain} routine feel way less annoying.`,
        productReveal: `I tried ${product} around the ${scene}, and this is the part that actually matters.`,
        proofLine: "Show the real use moment. That is what makes the claim believable.",
        cta: "Check it out and compare it with your current cleanup routine.",
        captions: ["Pet home smell check", "The spot guests notice first", "A tiny reset that actually fits the routine"],
        voiceover: `I love having pets, but I do not love wondering if my home smells like pets. I tried ${product} for the ${pain} problem, and the whole point is simple: show how it fits into a real cleanup routine around the ${scene}, without making it sound like magic.`,
        tone: profile.tone,
        culturalNote: "Use US creator-style emotional hooks, but keep the proof believable and demo-led.",
        hashtags: ["#PetTok", "#CleanTok", "#PetParent"],
      };
  }
}

export function getLocalizedCategoryLabel(input: SignalInput, value?: string | null) {
  const profile = getMarketProfile(value);
  const pain = localTerm(profile.code, "pain", input.painPoint || "pet_home_mess");
  const category = categoryTerm(profile.code, input.productCategory || "pet_cleaning");
  return `${pain} / ${category}`;
}

export function getLocalizedProductCategoryLabel(productCategory: string, value?: string | null) {
  const profile = getMarketProfile(value);
  return categoryTerm(profile.code, productCategory);
}

type UiLocale = "en" | "zh";

const UI_PRODUCT_CATEGORY_LABELS: Record<UiLocale, Record<string, string>> = {
  en: {
    automatic_litter_box: "Automatic litter box",
    cat_litter: "Cat litter",
    litter_mat: "Litter mat",
    cat_urine_cleaner: "Cat urine cleaner",
    pet_hair_remover: "Pet hair remover",
    fabric_odor_control: "Fabric odor control",
    dog_pad_cleanup: "Dog pad cleanup",
    litter_deodorizer: "Litter deodorizer",
    enzyme_odor_spray: "Enzyme odor spray",
    pet_cleaning: "Pet cleaning",
  },
  zh: {
    automatic_litter_box: "自动猫砂盆",
    cat_litter: "猫砂",
    litter_mat: "猫砂垫",
    cat_urine_cleaner: "猫尿清洁剂",
    pet_hair_remover: "宠物毛发清理器",
    fabric_odor_control: "织物除味",
    dog_pad_cleanup: "狗尿垫清洁",
    litter_deodorizer: "猫砂除味剂",
    enzyme_odor_spray: "酶除味喷雾",
    pet_cleaning: "宠物清洁",
  },
};

export function getUiProductCategoryLabel(productCategory?: string | null, locale: UiLocale = "en") {
  if (!productCategory) return UI_PRODUCT_CATEGORY_LABELS[locale].pet_cleaning;
  const normalized = productCategory.replace(/\s+/g, "_").replace(/-/g, "_").toLowerCase();
  return UI_PRODUCT_CATEGORY_LABELS[locale][normalized] || UI_PRODUCT_CATEGORY_LABELS.en[normalized] || humanize(productCategory);
}

export function getLocalizedAdPackFallback(input: SignalInput, value?: string | null): LocalizedAdPackFallback {
  const profile = getMarketProfile(value);
  const product = input.productName || "this pet-cleaning find";
  const pain = localTerm(profile.code, "pain", input.painPoint || "pet_home_mess");
  const scene = localTerm(profile.code, "scene", input.useScene || "pet_area");
  const category = categoryTerm(profile.code, input.productCategory || "pet_cleaning");
  const signal = getLocalizedTemplateSignal(input, profile.code);

  switch (profile.code) {
    case "en-GB":
      return {
        categoryLabel: `${pain} / ${category}`,
        template: {
          name: `${category} routine reset`,
          format: "relatable flat problem + close-up proof + understated CTA",
          structure: [signal.opener, signal.secondaryHook, signal.productReveal, signal.proofLine, signal.cta],
          riskNotes: ["Avoid permanent odour-removal promises.", "Keep proof visual and practical."],
        },
        source: {
          title: `${category} source candidate for UK pet homes`,
          productType: category,
          reasons: ["Clear everyday clean-up use case", "Works for practical demo content", "Low-friction home routine angle"],
        },
        strategy: {
          positioning: `${product} is framed as a practical pet-home reset for ${pain}.`,
          targetAudience: "UK pet owners who want their home to feel tidy without making a fuss.",
          corePainPoint: `The ${scene} can look fine but still feel a bit embarrassing before guests arrive.`,
          productPromise: "A small clean-up step that makes the daily routine easier to manage.",
          proofAngle: "understated real-home demo",
          offerAngle: "a sensible home-care upgrade that is easy to compare with the current routine",
        },
        scriptNames: { sprint: "15-second UGC reset", proof: "25-second practical demo" },
        sceneObjectives: ["Hook", "Problem", "Solution", "Proof", "CTA"],
        sceneVisuals: [
          `Handheld shot of the ${scene} in a real flat.`,
          `Close-up of the ${pain} problem without overdoing it.`,
          `Show ${product} being added to the routine.`,
          "Show the visible reset in one believable take.",
          "End on a calmer room shot and product close-up.",
        ],
        shotList: [
          "Floor-level shot before clean-up",
          "Close-up of the problem spot",
          "Product-in-hand reveal",
          "One-take use demo",
          "Texture or pickup close-up",
          "Owner reaction without overacting",
          "Pet in frame at a safe distance",
          "Final room reset shot",
        ],
        aiVideoPrompts: [
          `UK flat, vertical UGC, pet clean-up around ${scene}, natural daylight.`,
          `Close-up demo of ${product}, realistic hands, no exaggerated before-after.`,
          "Pet home routine reset, understated British creator style.",
          "Final tidy living room, pet visible, soft natural light.",
        ],
        compliance: {
          safeClaims: ["Helps refresh the pet area", "Fits into everyday pet-home clean-up", "Makes the routine feel easier"],
          avoidClaims: ["Permanently removes every odour", "Works on every surface", "Guaranteed safe for every pet"],
          saferPhrases: ["helps with everyday odour", "makes clean-up easier", "use as part of a regular reset"],
        },
        testingPlan: [
          { variant: "A", change: "Lead with guest-coming-over tension", successMetric: "2-second hold rate" },
          { variant: "B", change: "Lead with the visible problem spot", successMetric: "thumb-stop rate" },
          { variant: "C", change: "Lead with calm routine proof", successMetric: "save and click rate" },
        ],
      };
    case "th":
      return {
        categoryLabel: `${pain} / ${category}`,
        template: {
          name: `สูตรคอนเทนต์ ${category}`,
          format: "เปิดด้วยปัญหาในบ้าน + ใช้จริงให้เห็น + CTA แบบเพื่อนแนะนำ",
          structure: [signal.opener, signal.secondaryHook, signal.productReveal, signal.proofLine, signal.cta],
          riskNotes: ["อย่าพูดว่ากำจัดกลิ่นได้ถาวร", "เลี่ยงคำเคลมความปลอดภัยถ้าไม่มีหลักฐาน"],
        },
        source: {
          title: `สินค้ากลุ่ม ${category} สำหรับตลาดไทย`,
          productType: category,
          reasons: ["ปัญหาเห็นภาพง่าย", "เหมาะกับเดโมในบ้านจริง", "เล่าแบบเพื่อนแนะนำได้"],
        },
        strategy: {
          positioning: `${product} คือไอเท็มช่วยรีเซ็ตมุมสัตว์เลี้ยงสำหรับปัญหา ${pain}`,
          targetAudience: "คนเลี้ยงสัตว์ในไทยที่อยากให้บ้านสะอาดขึ้นแบบไม่ยุ่งยาก",
          corePainPoint: `${scene} เป็นมุมที่ดูเล็ก แต่ทำให้บ้านมีกลิ่นหรือดูไม่เรียบร้อยได้`,
          productPromise: "ช่วยให้การจัดการมุมนี้ง่ายขึ้นในรูทีนประจำวัน",
          proofAngle: "เดโมใช้จริงในบ้านจริง",
          offerAngle: "ไอเท็มดูแลง่ายที่คนเลี้ยงสัตว์เข้าใจทันที",
        },
        scriptNames: { sprint: "UGC 15 วิ แบบเพื่อนบอกต่อ", proof: "เดโม 25 วิ ใช้จริง" },
        sceneObjectives: ["เปิดปัญหา", "ขยายความเจ็บ", "โชว์สินค้า", "พิสูจน์", "ชวนกดดู"],
        sceneVisuals: [
          `ถ่ายมือถือให้เห็น ${scene} แบบบ้านจริง`,
          `ซูมปัญหา ${pain} ให้เข้าใจทันที`,
          `หยิบ ${product} เข้ามาในรูทีน`,
          "โชว์ตอนใช้จริงแบบไม่ตัดเยอะ",
          "ปิดด้วยมุมบ้านที่ดูเรียบร้อยขึ้นและสินค้าในเฟรม",
        ],
        shotList: [
          "มุมสัตว์เลี้ยงก่อนจัดการ",
          "ปัญหาระยะใกล้",
          "หยิบสินค้าเข้ากล้อง",
          "ใช้จริงแบบ one take",
          "รายละเอียดพื้นผิวหรือสิ่งที่เก็บได้",
          "รีแอ็กชันเจ้าของแบบธรรมชาติ",
          "มีน้องอยู่ในเฟรมแบบปลอดภัย",
          "ภาพหลังรีเซ็ตมุมบ้าน",
        ],
        aiVideoPrompts: [
          `วิดีโอแนว UGC แนวตั้ง 9:16 บ้านจริงในไทย มุม ${scene} แสงธรรมชาติ`,
          `เดโมสินค้า ${product} ระยะใกล้ มือจริง ไม่โอเวอร์เคลม`,
          "คอนเทนต์ทำความสะอาดบ้านที่มีสัตว์เลี้ยง โทน TikTok ไทย",
          "ภาพจบมุมบ้านสะอาดขึ้น มีสัตว์เลี้ยงอยู่ด้านหลัง",
        ],
        compliance: {
          safeClaims: ["ช่วยให้มุมสัตว์เลี้ยงสดชื่นขึ้น", "เหมาะกับรูทีนทำความสะอาดประจำวัน", "ช่วยให้จัดการง่ายขึ้น"],
          avoidClaims: ["กำจัดกลิ่นถาวร", "ปลอดภัยกับสัตว์ทุกตัวและทุกพื้นผิว", "ฆ่าเชื้อ 99.9% ถ้าไม่มีหลักฐาน"],
          saferPhrases: ["ช่วยลดกลิ่นในชีวิตประจำวัน", "ทำให้เก็บกวาดง่ายขึ้น", "ใช้คู่กับรูทีนทำความสะอาดปกติ"],
        },
        testingPlan: [
          { variant: "A", change: "เปิดด้วยประโยคแบบเพื่อนเตือน", successMetric: "อัตราดู 2 วินาที" },
          { variant: "B", change: "เปิดด้วยภาพปัญหาใกล้ๆ", successMetric: "thumb-stop rate" },
          { variant: "C", change: "เปิดด้วยเดโมหลังใช้", successMetric: "save และ click rate" },
        ],
      };
    case "id":
      return localizedPack("id", product, pain, scene, category, signal, {
        name: `Template ${category}`,
        format: "problem rumah sehari-hari + demo nyata + CTA soft",
        audience: "Pemilik hewan di Indonesia yang mau rumah lebih gampang diurus.",
        promise: "Bikin rutinitas bersih-bersih pet terasa lebih ringan.",
        safe: ["Membantu area pet terasa lebih fresh", "Cocok untuk rutinitas harian", "Membantu bersih-bersih lebih praktis"],
        avoid: ["Menghilangkan semua bau selamanya", "Aman untuk semua hewan dan permukaan", "Klaim medis atau steril tanpa bukti"],
        safer: ["membantu mengurangi bau harian", "bikin bersih-bersih lebih gampang", "dipakai sebagai bagian dari rutinitas rumah"],
      });
    case "vi":
      return localizedPack("vi", product, pain, scene, category, signal, {
        name: `Mẫu nội dung ${category}`,
        format: "vấn đề trong nhà + demo thật + CTA nhẹ",
        audience: "Người nuôi thú cưng ở Việt Nam muốn nhà gọn và dễ dọn hơn.",
        promise: "Giúp routine dọn dẹp thú cưng dễ quản lý hơn mỗi ngày.",
        safe: ["Giúp góc thú cưng dễ làm mới hơn", "Phù hợp routine dọn dẹp hằng ngày", "Giúp việc dọn dẹp nhẹ hơn"],
        avoid: ["Loại bỏ mọi mùi vĩnh viễn", "An toàn cho mọi thú cưng và mọi bề mặt", "Khẳng định y tế hoặc khử khuẩn khi chưa có bằng chứng"],
        safer: ["hỗ trợ giảm mùi hằng ngày", "giúp dọn dễ hơn", "dùng trong routine làm sạch thường xuyên"],
      });
    case "ms":
      return localizedPack("ms", product, pain, scene, category, signal, {
        name: `Templat ${category}`,
        format: "masalah rumah sebenar + demo mudah + CTA lembut",
        audience: "Pemilik haiwan di Malaysia yang mahu rumah lebih mudah dijaga.",
        promise: "Jadikan rutin bersihkan kawasan haiwan lebih senang.",
        safe: ["Membantu segarkan kawasan haiwan", "Sesuai untuk rutin harian", "Membantu kerja pembersihan rasa lebih mudah"],
        avoid: ["Buang semua bau secara kekal", "Selamat untuk semua haiwan dan semua permukaan", "Klaim kesihatan atau antibakteria tanpa bukti"],
        safer: ["membantu kurangkan bau harian", "memudahkan rutin bersih", "gunakan sebagai sebahagian rutin rumah"],
      });
    case "ja":
      return localizedPack("ja", product, pain, scene, category, signal, {
        name: `${category}向けテンプレート`,
        format: "日常の悩み + 実使用デモ + 控えめなCTA",
        audience: "ペットまわりを無理なく清潔に保ちたい日本の飼い主。",
        promise: "毎日のペットまわりの掃除を少し管理しやすくする。",
        safe: ["ペットまわりをリフレッシュしやすい", "日常の掃除ルーティンに取り入れやすい", "片づけを少しラクに感じさせる"],
        avoid: ["すべてのにおいを永久に消す", "すべてのペット・素材に安全と断言する", "根拠のない除菌・医療的表現"],
        safer: ["日常的なにおい対策をサポート", "掃除を少しラクにする", "普段のリセット習慣の一部として使える"],
      });
    case "es":
      return localizedPack("es", product, pain, scene, category, signal, {
        name: `Plantilla para ${category}`,
        format: "problema cotidiano + demo real + CTA suave",
        audience: "Personas con mascotas en LATAM que quieren una casa más fácil de mantener.",
        promise: "Hacer más simple una parte molesta de la limpieza diaria con mascotas.",
        safe: ["Ayuda a refrescar el área de la mascota", "Sirve para la rutina diaria", "Hace la limpieza más práctica"],
        avoid: ["Elimina todos los olores para siempre", "Seguro para todas las mascotas y superficies", "Claims médicos o de desinfección sin prueba"],
        safer: ["ayuda con el olor del día a día", "facilita la limpieza", "úsalo como parte de una rutina regular"],
      });
    case "pt-BR":
      return localizedPack("pt-BR", product, pain, scene, category, signal, {
        name: `Template para ${category}`,
        format: "problema real em casa + demo simples + CTA leve",
        audience: "Pessoas com pet no Brasil que querem uma casa mais fácil de manter limpa.",
        promise: "Deixar uma parte chata da limpeza com pets mais fácil no dia a dia.",
        safe: ["Ajuda a renovar a área do pet", "Encaixa na rotina diária", "Facilita a limpeza do dia a dia"],
        avoid: ["Remove todo cheiro para sempre", "Seguro para todos os pets e superfícies", "Claims médicos ou antibacterianos sem prova"],
        safer: ["ajuda com o cheiro do dia a dia", "facilita a limpeza", "use como parte da rotina de casa"],
      });
    case "en-US":
    default:
      return {
        categoryLabel: `${pain} / ${category}`,
        template: {
          name: `${category} creator demo`,
          format: "POV pain point + close-up proof + native TikTok CTA",
          structure: [signal.opener, signal.secondaryHook, signal.productReveal, signal.proofLine, signal.cta],
          riskNotes: ["Avoid miracle odor-removal claims.", "Keep every proof moment visible and grounded."],
        },
        source: {
          title: `${category} source candidate for US pet homes`,
          productType: category,
          reasons: ["Strong pet-parent pain point", "Easy visual demo", "Fits creator-led TikTok storytelling"],
        },
        strategy: {
          positioning: `${product} is positioned as a practical pet-home reset for ${pain}.`,
          targetAudience: "US pet parents who want their home to feel cleaner before anyone notices the pet mess.",
          corePainPoint: `The ${scene} can look small on camera, but it is the thing people notice first.`,
          productPromise: "Make one annoying pet-cleaning moment easier to reset in a daily routine.",
          proofAngle: "native UGC demo with visible routine proof",
          offerAngle: "a low-friction pet-home upgrade that is easy to understand in one demo",
        },
        scriptNames: { sprint: "15-second UGC sprint", proof: "25-second proof demo" },
        sceneObjectives: ["Hook", "Problem", "Solution", "Proof", "CTA"],
        sceneVisuals: [
          `Handheld shot of the ${scene} in a real home.`,
          `Close-up of the ${pain} problem.`,
          `Introduce ${product} with a clean product-in-hand reveal.`,
          "Show one clear use moment without exaggerated before-after.",
          "End with a cleaner-feeling room shot and product close-up.",
        ],
        shotList: [
          "Floor-level shot of the pet area before cleanup",
          "Close-up of the problem source",
          "Product-in-hand reveal",
          "One-take usage demo",
          "Texture, spray, mat, brush, or pickup close-up",
          "Owner reaction without overacting",
          "Pet-safe distance shot with the pet in frame",
          "Final room reset shot with product visible",
        ],
        aiVideoPrompts: [
          `Vertical 9:16 UGC shot of a real US pet home, ${scene}, natural light.`,
          `Close-up product demo for ${product}, realistic hands, no exaggerated before-after.`,
          "Floor-level pet-home cleaning scene, product in frame, authentic TikTok ad style.",
          "Final clean living room reset, pet visible in background, warm home lighting.",
        ],
        compliance: {
          safeClaims: ["Helps refresh the pet area", "Designed for everyday pet-home cleanup", "Makes cleanup feel easier"],
          avoidClaims: ["Kills 99.9% of bacteria unless verified", "Permanently removes every odor", "Guaranteed safe for every pet and every surface"],
          saferPhrases: ["helps reduce everyday pet-home odor", "makes cleanup feel easier", "works as part of a regular home reset routine"],
        },
        testingPlan: [
          { variant: "A", change: "Lead with guest embarrassment", successMetric: "2-second hold rate" },
          { variant: "B", change: "Lead with visible mess close-up", successMetric: "thumb-stop rate" },
          { variant: "C", change: "Lead with casual creator slang", successMetric: "save and click rate" },
        ],
      };
  }
}

function localizedPack(
  code: TargetMarketCode,
  product: string,
  pain: string,
  scene: string,
  category: string,
  signal: LocalizedTemplateSignal,
  copy: {
    name: string;
    format: string;
    audience: string;
    promise: string;
    safe: string[];
    avoid: string[];
    safer: string[];
  },
): LocalizedAdPackFallback {
  return {
    categoryLabel: `${pain} / ${category}`,
    template: {
      name: copy.name,
      format: copy.format,
      structure: [signal.opener, signal.secondaryHook, signal.productReveal, signal.proofLine, signal.cta],
      riskNotes: copy.avoid.slice(0, 2),
    },
    source: {
      title: `${category} · ${pain}`,
      productType: category,
      reasons: [copy.promise, signal.culturalNote, "Demo-led proof angle"],
    },
    strategy: {
      positioning: `${product} · ${pain}`,
      targetAudience: copy.audience,
      corePainPoint: `${scene} / ${pain}`,
      productPromise: copy.promise,
      proofAngle: copy.format,
      offerAngle: signal.culturalNote,
    },
    scriptNames: {
      sprint: code === "ja" ? "15秒UGC" : code === "es" ? "UGC de 15 segundos" : code === "pt-BR" ? "UGC de 15 segundos" : "15s UGC",
      proof: code === "ja" ? "25秒デモ" : code === "es" ? "Demo de 25 segundos" : code === "pt-BR" ? "Demo de 25 segundos" : "25s demo",
    },
    sceneObjectives: [signal.opener, signal.secondaryHook, signal.productReveal, signal.proofLine, signal.cta],
    sceneVisuals: [
      `${scene}`,
      `${pain}`,
      `${product}`,
      signal.proofLine,
      signal.cta,
    ],
    shotList: [
      signal.opener,
      signal.secondaryHook,
      signal.productReveal,
      signal.proofLine,
      signal.cta,
      signal.captions[0],
      signal.captions[1],
      signal.captions[2],
    ].filter(Boolean),
    aiVideoPrompts: [
      `${scene}, vertical 9:16 UGC, real home, natural light`,
      `${product}, close-up practical demo, realistic hands`,
      `${pain}, pet-home cleaning routine, native creator style`,
      `${signal.cta}, final clean home shot with pet in background`,
    ],
    compliance: {
      safeClaims: copy.safe,
      avoidClaims: copy.avoid,
      saferPhrases: copy.safer,
    },
    testingPlan: [
      { variant: "A", change: signal.opener, successMetric: "2-second hold rate" },
      { variant: "B", change: signal.proofLine, successMetric: "thumb-stop rate" },
      { variant: "C", change: signal.cta, successMetric: "click/save rate" },
    ],
  };
}

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function defaultProductTerm(code: TargetMarketCode) {
  const terms: Record<TargetMarketCode, string> = {
    "en-US": "this pet-cleaning find",
    "en-GB": "this pet clean-up find",
    th: "ไอเท็มนี้",
    id: "produk ini",
    vi: "món này",
    ms: "produk ni",
    ja: "このアイテム",
    es: "este producto",
    "pt-BR": "esse achadinho",
  };
  return terms[code];
}

const LOCAL_TERMS: Partial<Record<TargetMarketCode, Record<"pain" | "scene", Record<string, string>>>> = {
  "en-US": {
    pain: {
      cleaning_time: "daily litter cleanup",
      litter_box_smell: "litter box smell",
      litter_tracking: "tracked litter",
      multi_pet_mess: "multi-pet mess",
      cat_litter_odor: "cat litter odor",
      cat_urine_cleanup: "cat urine cleanup",
      pet_hair_cleanup: "pet hair cleanup",
      fabric_odor: "pet smell on fabric",
      dog_pad_floor: "dog pad floor mess",
      pet_home_mess: "pet-home mess",
    },
    scene: {
      litter_box_area: "litter box area",
      pet_cleaning_area: "pet cleaning area",
      pet_area: "pet area",
    },
  },
  "en-GB": {
    pain: {
      cleaning_time: "daily litter clean-up",
      litter_box_smell: "litter tray smell",
      litter_tracking: "tracked cat litter",
      multi_pet_mess: "multi-pet mess",
      cat_litter_odor: "cat litter odour",
      cat_urine_cleanup: "cat wee clean-up",
      pet_hair_cleanup: "pet hair clean-up",
      fabric_odor: "pet odour on fabric",
      dog_pad_floor: "puppy pad floor mess",
      pet_home_mess: "pet-home mess",
    },
    scene: {
      litter_box_area: "litter tray area",
      pet_cleaning_area: "pet clean-up area",
      pet_area: "pet area",
    },
  },
  th: {
    pain: {
      cleaning_time: "การเก็บกระบะทรายที่เสียเวลา",
      litter_box_smell: "กลิ่นกระบะทราย",
      litter_tracking: "ทรายแมวติดเท้าออกมา",
      multi_pet_mess: "บ้านเลี้ยงหลายตัวที่เลอะง่าย",
      cat_litter_odor: "กลิ่นทรายแมว",
      cat_urine_cleanup: "คราบฉี่แมว",
      pet_hair_cleanup: "ขนสัตว์ติดบ้าน",
      fabric_odor: "กลิ่นติดผ้าและโซฟา",
      dog_pad_floor: "พื้นรอบแผ่นรองฉี่",
      pet_home_mess: "มุมสัตว์เลี้ยงที่จัดการยาก",
    },
    scene: {
      litter_box_area: "มุมกระบะทราย",
      pet_cleaning_area: "มุมทำความสะอาดของน้อง",
      pet_area: "มุมของน้อง",
    },
  },
  id: {
    pain: {
      cleaning_time: "rutinitas bersihin litter box yang makan waktu",
      litter_box_smell: "bau litter box",
      litter_tracking: "pasir kucing yang kebawa ke mana-mana",
      multi_pet_mess: "rumah multi-pet yang cepat berantakan",
      cat_litter_odor: "bau pasir kucing",
      cat_urine_cleanup: "bekas pipis kucing",
      pet_hair_cleanup: "bulu hewan yang nempel",
      fabric_odor: "bau pet di kain dan sofa",
      dog_pad_floor: "area pee pad yang gampang kotor",
      pet_home_mess: "area pet yang susah rapi",
    },
    scene: {
      litter_box_area: "area litter box",
      pet_cleaning_area: "area bersih-bersih pet",
      pet_area: "area pet",
    },
  },
  vi: {
    pain: {
      cleaning_time: "việc dọn khay cát mất thời gian",
      litter_box_smell: "mùi khay cát",
      litter_tracking: "cát mèo vương ra sàn",
      multi_pet_mess: "nhà nuôi nhiều bé dễ bừa",
      cat_litter_odor: "mùi cát mèo",
      cat_urine_cleanup: "vết nước tiểu mèo",
      pet_hair_cleanup: "lông thú bám khắp nhà",
      fabric_odor: "mùi thú cưng trên vải và sofa",
      dog_pad_floor: "sàn quanh tấm lót vệ sinh",
      pet_home_mess: "góc thú cưng khó dọn",
    },
    scene: {
      litter_box_area: "khu khay cát",
      pet_cleaning_area: "khu dọn dẹp cho thú cưng",
      pet_area: "góc thú cưng",
    },
  },
  ms: {
    pain: {
      cleaning_time: "rutin bersihkan litter box yang makan masa",
      litter_box_smell: "bau litter box",
      litter_tracking: "pasir kucing bersepah",
      multi_pet_mess: "rumah banyak haiwan yang cepat bersepah",
      cat_litter_odor: "bau pasir kucing",
      cat_urine_cleanup: "kesan kencing kucing",
      pet_hair_cleanup: "bulu haiwan melekat",
      fabric_odor: "bau haiwan pada kain dan sofa",
      dog_pad_floor: "lantai sekitar pad kencing",
      pet_home_mess: "kawasan haiwan yang susah dijaga",
    },
    scene: {
      litter_box_area: "kawasan litter box",
      pet_cleaning_area: "kawasan bersih haiwan",
      pet_area: "kawasan haiwan",
    },
  },
  ja: {
    pain: {
      cleaning_time: "猫砂まわりの掃除時間",
      litter_box_smell: "トイレまわりのにおい",
      litter_tracking: "床に散らばる猫砂",
      multi_pet_mess: "多頭飼いの汚れやすさ",
      cat_litter_odor: "猫砂のにおい",
      cat_urine_cleanup: "猫のおしっこ汚れ",
      pet_hair_cleanup: "ペットの抜け毛",
      fabric_odor: "布やソファに残るにおい",
      dog_pad_floor: "トイレシートまわりの床汚れ",
      pet_home_mess: "ペットまわりの小さな汚れ",
    },
    scene: {
      litter_box_area: "猫トイレまわり",
      pet_cleaning_area: "ペットまわりの掃除エリア",
      pet_area: "ペットまわり",
    },
  },
  es: {
    pain: {
      cleaning_time: "limpiar el arenero todos los días",
      litter_box_smell: "olor del arenero",
      litter_tracking: "arena regada por la casa",
      multi_pet_mess: "desorden de una casa con varias mascotas",
      cat_litter_odor: "olor de la arena para gato",
      cat_urine_cleanup: "limpieza de orina de gato",
      pet_hair_cleanup: "pelos de mascota por todos lados",
      fabric_odor: "olor a mascota en telas y sillón",
      dog_pad_floor: "piso alrededor del tapete sanitario",
      pet_home_mess: "desorden típico de mascotas",
    },
    scene: {
      litter_box_area: "zona del arenero",
      pet_cleaning_area: "zona de limpieza de la mascota",
      pet_area: "rincón de la mascota",
    },
  },
  "pt-BR": {
    pain: {
      cleaning_time: "tempo limpando a caixa de areia",
      litter_box_smell: "cheiro da caixa de areia",
      litter_tracking: "areia espalhada pela casa",
      multi_pet_mess: "bagunça de casa com vários pets",
      cat_litter_odor: "cheiro da areia do gato",
      cat_urine_cleanup: "limpeza de xixi de gato",
      pet_hair_cleanup: "pelo de pet grudado",
      fabric_odor: "cheiro de pet no tecido e no sofá",
      dog_pad_floor: "piso perto do tapete higiênico",
      pet_home_mess: "baguncinha de casa com pet",
    },
    scene: {
      litter_box_area: "cantinho da caixa de areia",
      pet_cleaning_area: "área de limpeza do pet",
      pet_area: "cantinho do pet",
    },
  },
};

function localTerm(code: TargetMarketCode, group: "pain" | "scene", value: string) {
  const key = value.replace(/\s+/g, "_").toLowerCase();
  return LOCAL_TERMS[code]?.[group]?.[key] || LOCAL_TERMS["en-US"]?.[group]?.[key] || humanize(value).toLowerCase();
}

const CATEGORY_TERMS: Partial<Record<TargetMarketCode, Record<string, string>>> = {
  "en-US": {
    automatic_litter_box: "automatic litter box",
    cat_litter: "cat litter",
    litter_mat: "litter mat",
    cat_urine_cleaner: "cat urine cleaner",
    pet_hair_remover: "pet hair remover",
    fabric_odor_control: "fabric odor control",
    dog_pad_cleanup: "dog pad cleanup",
    litter_deodorizer: "litter deodorizer",
    enzyme_odor_spray: "enzyme odor spray",
    pet_cleaning: "pet cleaning",
  },
  "en-GB": {
    automatic_litter_box: "automatic litter tray",
    cat_litter: "cat litter",
    litter_mat: "litter mat",
    cat_urine_cleaner: "cat wee cleaner",
    pet_hair_remover: "pet hair remover",
    fabric_odor_control: "fabric odour control",
    dog_pad_cleanup: "puppy pad clean-up",
    litter_deodorizer: "litter deodoriser",
    enzyme_odor_spray: "enzyme odour spray",
    pet_cleaning: "pet clean-up",
  },
  th: {
    automatic_litter_box: "กระบะทรายอัตโนมัติ",
    cat_litter: "ทรายแมว",
    litter_mat: "แผ่นดักทรายแมว",
    cat_urine_cleaner: "น้ำยาทำความสะอาดฉี่แมว",
    pet_hair_remover: "อุปกรณ์เก็บขนสัตว์",
    fabric_odor_control: "สเปรย์ลดกลิ่นผ้า",
    dog_pad_cleanup: "ทำความสะอาดแผ่นรองฉี่",
    litter_deodorizer: "ตัวช่วยลดกลิ่นทรายแมว",
    enzyme_odor_spray: "สเปรย์เอนไซม์ลดกลิ่น",
    pet_cleaning: "ของใช้ทำความสะอาดสัตว์เลี้ยง",
  },
  id: {
    automatic_litter_box: "litter box otomatis",
    cat_litter: "pasir kucing",
    litter_mat: "mat pasir kucing",
    cat_urine_cleaner: "pembersih pipis kucing",
    pet_hair_remover: "pembersih bulu hewan",
    fabric_odor_control: "pengurang bau kain",
    dog_pad_cleanup: "pembersih area pee pad",
    litter_deodorizer: "pengurang bau pasir kucing",
    enzyme_odor_spray: "spray enzim pengurang bau",
    pet_cleaning: "produk bersih-bersih pet",
  },
  vi: {
    automatic_litter_box: "khay vệ sinh tự động",
    cat_litter: "cát mèo",
    litter_mat: "thảm hứng cát mèo",
    cat_urine_cleaner: "dung dịch dọn nước tiểu mèo",
    pet_hair_remover: "dụng cụ lấy lông thú",
    fabric_odor_control: "khử mùi vải",
    dog_pad_cleanup: "dọn khu lót vệ sinh chó",
    litter_deodorizer: "khử mùi cát mèo",
    enzyme_odor_spray: "xịt enzyme khử mùi",
    pet_cleaning: "đồ dọn dẹp thú cưng",
  },
  ms: {
    automatic_litter_box: "litter box automatik",
    cat_litter: "pasir kucing",
    litter_mat: "alas pasir kucing",
    cat_urine_cleaner: "pembersih kencing kucing",
    pet_hair_remover: "pembersih bulu haiwan",
    fabric_odor_control: "kawalan bau fabrik",
    dog_pad_cleanup: "pembersih kawasan pad kencing",
    litter_deodorizer: "pengurang bau pasir kucing",
    enzyme_odor_spray: "semburan enzim bau",
    pet_cleaning: "produk bersih haiwan",
  },
  ja: {
    automatic_litter_box: "自動猫トイレ",
    cat_litter: "猫砂",
    litter_mat: "猫砂マット",
    cat_urine_cleaner: "猫のおしっこクリーナー",
    pet_hair_remover: "ペットの抜け毛クリーナー",
    fabric_odor_control: "布用ペット消臭",
    dog_pad_cleanup: "トイレシートまわり掃除",
    litter_deodorizer: "猫砂消臭アイテム",
    enzyme_odor_spray: "酵素系消臭スプレー",
    pet_cleaning: "ペット掃除グッズ",
  },
  es: {
    automatic_litter_box: "arenero automático",
    cat_litter: "arena para gato",
    litter_mat: "tapete para arena",
    cat_urine_cleaner: "limpiador de orina de gato",
    pet_hair_remover: "removedor de pelo de mascota",
    fabric_odor_control: "control de olor en telas",
    dog_pad_cleanup: "limpieza de tapete sanitario",
    litter_deodorizer: "desodorizante de arena",
    enzyme_odor_spray: "spray enzimático antiolor",
    pet_cleaning: "limpieza para mascotas",
  },
  "pt-BR": {
    automatic_litter_box: "caixa de areia automática",
    cat_litter: "areia de gato",
    litter_mat: "tapete coletor de areia",
    cat_urine_cleaner: "limpador de xixi de gato",
    pet_hair_remover: "removedor de pelo pet",
    fabric_odor_control: "controle de cheiro em tecido",
    dog_pad_cleanup: "limpeza de tapete higiênico",
    litter_deodorizer: "desodorizador de areia",
    enzyme_odor_spray: "spray enzimático antiodor",
    pet_cleaning: "limpeza para pets",
  },
};

function categoryTerm(code: TargetMarketCode, value: string) {
  const normalized = value.replace(/\s+/g, "_").replace(/-/g, "_").toLowerCase();
  return CATEGORY_TERMS[code]?.[normalized] || CATEGORY_TERMS["en-US"]?.[normalized] || humanize(value).toLowerCase();
}
