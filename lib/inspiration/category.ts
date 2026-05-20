import type { Product } from "@/lib/tiktok-adgen/types";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Beauty & Personal Care": [
    "beauty", "skincare", "makeup", "cosmetic", "lipstick", "foundation", "serum", "moisturizer",
    "cream", "lotion", "perfume", "fragrance", "hair", "shampoo", "conditioner", "nail",
    "eyeshadow", "mascara", "concealer", "sunscreen", "spf", "cleanser", "toner", "mask",
    "beard", "shaver", "razor", "deodorant", "bath", "body wash",
  ],
  Electronics: [
    "electronic", "phone", "case", "charger", "cable", "headphone", "earbuds", "speaker",
    "camera", "laptop", "tablet", "watch", "smart", "wireless", "bluetooth", "usb", "led",
    "lamp", "light", "projector", "keyboard", "mouse", "monitor", "gaming", "controller",
    "power bank", "adapter", "hub", "dock", "airpods", "screen protector",
  ],
  Fashion: [
    "fashion", "clothing", "dress", "shirt", "pants", "jeans", "jacket", "coat", "sweater",
    "hoodie", "sneaker", "shoe", "boot", "sandal", "heel", "bag", "purse", "wallet",
    "jewelry", "necklace", "bracelet", "ring", "earring", "sunglasses", "hat", "cap",
    "scarf", "belt", "watch", "swimwear", "underwear", "sock",
  ],
  "Home & Kitchen": [
    "home", "kitchen", "furniture", "decor", "organizer", "storage", "shelf", "lamp",
    "pillow", "blanket", "towel", "curtain", "rug", "mat", "cup", "mug", "bottle",
    "container", "pan", "pot", "knife", "cutting board", "appliance", " blender", "mixer",
    "coffee", "maker", "vacuum", "cleaner", "air purifier", "humidifier",
  ],
  Health: [
    "health", "vitamin", "supplement", "protein", "fitness", "gym", "yoga", "exercise",
    "massage", "therapy", "relief", "pain", "sleep", "wellness", "medical", "first aid",
    "bandage", "pill", "capsule", "oil", "essential", "diffuser", "scale", "blood pressure",
    "thermometer", "pulse oximeter",
  ],
  "Sports & Outdoor": [
    "sport", "outdoor", "camping", "hiking", "fishing", "cycling", "running", "swimming",
    "surfing", "skiing", "snowboard", "tent", "backpack", "water bottle", "gloves",
    "helmet", "knee pad", " resistance band", "dumbbell", "kettlebell", "jump rope",
    "ab roller", "pull up", "push up",
  ],
  "Toys & Games": [
    "toy", "game", "puzzle", "lego", "doll", "figure", "action", "board game", "card game",
    "remote control", "rc", "drone", "building", "blocks", "stuffed", "plush", "fidget",
    "spinner", "slime", "play", "kid", "child", "baby", "infant", "toddler",
  ],
};

export function inferCategory(product: Product): string | null {
  const text = [
    product.title || "",
    product.description || "",
    ...(product.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  if (!text.trim()) return null;

  let bestCategory: string | null = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestScore >= 2 ? bestCategory : null;
}
