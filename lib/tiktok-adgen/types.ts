export const PLANS = {
  free: {
    name: "Free",
    dailyLimit: 3,
    price: 0,
    features: ["3 ad packs/day", "Source match scoring", "Pet cleaning templates", "Hooks + UGC scripts"],
  },
  pro: {
    name: "Pro",
    dailyLimit: -1,
    price: 9.9,
    features: [
      "Unlimited ad packs",
      "Source match scoring",
      "Pet cleaning templates",
      "Hooks + UGC scripts",
      "Claim safety guidance",
      "JSON and Markdown export",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export type DBUser = {
  id: string;
  email: string;
  name: string;
  password: string;
  plan: PlanId;
  apiKey: string;
  usage?: Record<string, number>;
  createdAt: string;
  teamId: string | null;
};

export type DBTeam = {
  id: string;
  name: string;
  members: string[];
  invites: string[];
  createdAt: string;
};

export type DB = {
  users: Record<string, DBUser>;
  teams: Record<string, DBTeam>;
  sessions: Record<string, string>;
};

export type Product = {
  title: string;
  description: string;
  price: string;
  images: string[];
  tags: string[];
};

export type UsageSnapshot = {
  used: number;
  limit: number;
  remaining: number;
  plan: PlanId;
};

/** Public user shape returned by /api/auth/me and auth login/register. */
export type PublicUser = {
  id: string;
  email: string;
  name: string;
  plan: PlanId;
  apiKey?: string;
  teamId?: string | null;
  usage?: UsageSnapshot;
};

