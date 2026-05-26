import type { Product } from "@/lib/tiktok-adgen/types";

export const VERTICAL_DOMAINS = {
  general: {
    label: "General ecommerce",
    audience: "Online shoppers who respond to practical benefits, clear demos, and social proof",
    painPoints: ["unclear product value", "purchase hesitation", "need for quick proof"],
    visualLanguage: "clean product close-ups, hands-on usage, before-and-after moments, creator-style framing",
    proofPattern: "show the product solving one clear problem, then reinforce with a fast result or testimonial",
    complianceNotes: "avoid exaggerated claims and keep results believable",
    ctaStyle: "simple value-led call to action",
  },
  beauty: {
    label: "Beauty and skincare",
    audience: "Beauty buyers comparing texture, routine fit, visible finish, and creator recommendations",
    painPoints: ["skin concern frustration", "routine fatigue", "fear of wasting money on another product"],
    visualLanguage: "macro texture shots, bathroom vanity scenes, natural-light application, soft skin detail shots",
    proofPattern: "routine problem, application texture, immediate finish, realistic expectation, social proof",
    complianceNotes: "avoid medical claims, guaranteed results, or unrealistic before-after promises",
    ctaStyle: "routine upgrade with a low-friction trial angle",
  },
  fashion: {
    label: "Fashion and accessories",
    audience: "Style-conscious shoppers looking for fit, versatility, quality, and outfit inspiration",
    painPoints: ["hard to style", "poor fit anxiety", "limited outfit options", "quality uncertainty"],
    visualLanguage: "mirror try-ons, quick outfit changes, fabric close-ups, street-style movement shots",
    proofPattern: "show 3 ways to wear it, then zoom into fit and material proof",
    complianceNotes: "do not imply unavailable sizes, discounts, or scarcity unless product data supports it",
    ctaStyle: "style confidence and wardrobe versatility",
  },
  home: {
    label: "Home and lifestyle",
    audience: "Home shoppers who want practical upgrades, tidier spaces, and products that feel easy to use",
    painPoints: ["messy spaces", "daily inconvenience", "small home frustrations", "setup anxiety"],
    visualLanguage: "before-after room scenes, overhead organization shots, satisfying setup sequences, warm home lighting",
    proofPattern: "messy problem, simple setup, satisfying transformation, everyday usage",
    complianceNotes: "avoid overpromising durability or compatibility beyond known product details",
    ctaStyle: "make the daily routine easier",
  },
  pet: {
    label: "Pet products",
    audience: "Pet owners who care about comfort, safety, enrichment, cleanliness, and convenience",
    painPoints: ["pet boredom", "mess cleanup", "training friction", "owner guilt", "comfort concerns"],
    visualLanguage: "pet reaction shots, owner-and-pet interaction, floor-level camera angles, cozy home scenes",
    proofPattern: "owner problem, pet curiosity, product interaction, calm or happy result",
    complianceNotes: "avoid veterinary or health treatment claims unless provided by product data",
    ctaStyle: "better daily care for your pet",
  },
  fitness: {
    label: "Fitness and wellness",
    audience: "People seeking simple routines, visible progress cues, convenience, and motivational tools",
    painPoints: ["low motivation", "limited time", "home workout friction", "unclear progress"],
    visualLanguage: "energetic cuts, form demonstrations, sweat/detail shots, timer overlays, progress moments",
    proofPattern: "barrier to workout, quick demo, ease-of-use proof, motivating result",
    complianceNotes: "avoid guaranteed weight-loss, medical, or body-transformation claims",
    ctaStyle: "start today with a practical routine",
  },
  electronics: {
    label: "Consumer electronics",
    audience: "Tech buyers comparing usefulness, specs, setup simplicity, and real-world performance",
    painPoints: ["setup complexity", "poor battery life", "compatibility worries", "unclear feature value"],
    visualLanguage: "desk setup shots, UI/device close-ups, unboxing, feature callouts, real-world use cases",
    proofPattern: "annoying tech problem, one-tap setup, feature demo, measurable convenience",
    complianceNotes: "do not invent specs, compatibility, warranty, or performance numbers",
    ctaStyle: "upgrade the workflow with less friction",
  },
  parenting: {
    label: "Baby and parenting",
    audience: "Parents looking for safe, practical, time-saving products that reduce daily stress",
    painPoints: ["time pressure", "mess", "sleep disruption", "safety concerns", "travel friction"],
    visualLanguage: "calm family scenes, close-up safe usage, diaper-bag or nursery setup, parent reaction shots",
    proofPattern: "parent stress, product setup, calmer routine, practical relief",
    complianceNotes: "avoid medical, safety certification, or developmental claims unless product data supports them",
    ctaStyle: "make parenting routines calmer and simpler",
  },
} as const;

export type VerticalDomainId = keyof typeof VERTICAL_DOMAINS;

export interface StoryboardOptions {
  vertical?: VerticalDomainId;
  creativeAngle?: string;
}

export type CameraMovement =
  | "static"
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right"
  | "tilt-up"
  | "tilt-down"
  | "tracking";

export type Transition =
  | "cut"
  | "fade"
  | "dissolve"
  | "wipe"
  | "zoom";

export interface StoryboardFrame {
  scene: number;
  startTime: number;
  endTime: number;
  duration: number;
  visual: string;
  camera: CameraMovement;
  textOverlay: string;
  narration: string;
  transition: Transition;
}

export interface StoryboardData {
  product: Product;
  totalDuration: number;
  frames: StoryboardFrame[];
  metadata: {
    style: string;
    targetAudience: string;
    platform: string;
    vertical: VerticalDomainId;
    creativeAngle: string;
    productionNotes: string[];
  };
}

export const CAMERA_LABELS: Record<CameraMovement, string> = {
  "static": "Static",
  "zoom-in": "Zoom in",
  "zoom-out": "Zoom out",
  "pan-left": "Pan left",
  "pan-right": "Pan right",
  "tilt-up": "Tilt up",
  "tilt-down": "Tilt down",
  "tracking": "Tracking",
};

export const TRANSITION_LABELS: Record<Transition, string> = {
  "cut": "Cut",
  "fade": "Fade",
  "dissolve": "Dissolve",
  "wipe": "Wipe",
  "zoom": "Zoom",
};
