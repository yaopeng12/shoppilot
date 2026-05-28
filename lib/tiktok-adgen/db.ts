import fs from "fs/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/inspiration/supabase";

type UsageDB = {
  usage: Record<string, Record<string, number>>;
};

export type DBUser = {
  id: string;
  email: string;
  name: string;
  image?: string;
  plan: "free" | "pro" | "team";
  apiKey?: string;
  apiKeyLast4?: string;
  passwordHash?: string;
  emailVerifiedAt?: string | null;
  verificationCodeHash?: string | null;
  verificationCodeExpiresAt?: string | null;
  createdAt: string;
};

type UsersDB = {
  users: Record<string, DBUser>;
};

type ProfileRow = {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  plan: "free" | "pro" | "team";
  api_key_hash: string | null;
  api_key_last4: string | null;
  password_hash?: string | null;
  email_verified_at?: string | null;
  verification_code_hash?: string | null;
  verification_code_expires_at?: string | null;
  created_at: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USAGE_FILE = path.join(DATA_DIR, "usage.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PROFILE_SELECT = "id,email,name,image,plan,api_key_hash,api_key_last4,password_hash,email_verified_at,verification_code_hash,verification_code_expires_at,created_at";
const PROFILE_SELECT_COMPAT = "id,email,name,image,plan,api_key_hash,api_key_last4,created_at";
const AUTH_IMAGE_PREFIX = "email-auth:v1:";

async function ensureDir() {
  if (!existsSync(DATA_DIR)) await fs.mkdir(DATA_DIR, { recursive: true });
}

// ===== Usage DB =====

async function ensureUsageFile() {
  await ensureDir();
  if (!existsSync(USAGE_FILE)) {
    await fs.writeFile(USAGE_FILE, JSON.stringify({ usage: {} }, null, 2));
  }
}

async function loadUsageDB(): Promise<UsageDB> {
  await ensureUsageFile();
  try {
    return JSON.parse(await fs.readFile(USAGE_FILE, "utf-8")) as UsageDB;
  } catch {
    return { usage: {} };
  }
}

async function saveUsageDB(db: UsageDB) {
  await ensureUsageFile();
  await fs.writeFile(USAGE_FILE, JSON.stringify(db, null, 2));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getUsage(userId: string): { used: number } {
  const db = readUsageSync();
  const userUsage = db.usage[userId] || {};
  return { used: userUsage[todayKey()] || 0 };
}

export function recordUsage(userId: string) {
  const db = readUsageSync();
  if (!db.usage[userId]) db.usage[userId] = {};
  const today = todayKey();
  db.usage[userId][today] = (db.usage[userId][today] || 0) + 1;

  // Prune old entries
  const monthAgo = todayKey().slice(0, 8);
  for (const k of Object.keys(db.usage[userId])) {
    if (k < monthAgo) delete db.usage[userId][k];
  }

  writeUsageSync(db);
}

function readUsageSync(): UsageDB {
  try {
    if (!existsSync(USAGE_FILE)) return { usage: {} };
    return JSON.parse(readFileSync(USAGE_FILE, "utf-8")) as UsageDB;
  } catch {
    return { usage: {} };
  }
}

function writeUsageSync(db: UsageDB) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(USAGE_FILE, JSON.stringify(db, null, 2));
  } catch {}
}

// ===== Users DB =====

function readUsersSync(): UsersDB {
  try {
    if (!existsSync(USERS_FILE)) return { users: {} };
    return JSON.parse(readFileSync(USERS_FILE, "utf-8")) as UsersDB;
  } catch {
    return { users: {} };
  }
}

function writeUsersSync(db: UsersDB) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(USERS_FILE, JSON.stringify(db, null, 2));
  } catch {}
}

function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

function profileToUser(profile: ProfileRow, apiKey?: string): DBUser {
  const authPayload = parseAuthImagePayload(profile.image);
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name || "",
    plan: profile.plan || "free",
    apiKey: apiKey || (profile.api_key_last4 ? `tk_...${profile.api_key_last4}` : undefined),
    apiKeyLast4: profile.api_key_last4 || undefined,
    image: authPayload ? undefined : profile.image || undefined,
    passwordHash: profile.password_hash || authPayload?.passwordHash || undefined,
    emailVerifiedAt: profile.email_verified_at || authPayload?.emailVerifiedAt || null,
    verificationCodeHash: profile.verification_code_hash || authPayload?.verificationCodeHash || null,
    verificationCodeExpiresAt: profile.verification_code_expires_at || authPayload?.verificationCodeExpiresAt || null,
    createdAt: profile.created_at,
  };
}

async function getProfile(userId: string): Promise<DBUser | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    const compat = await supabase
      .from("profiles")
      .select(PROFILE_SELECT_COMPAT)
      .eq("id", userId)
      .maybeSingle();
    if (compat.error) {
      console.error("Supabase getProfile error:", error);
      return null;
    }
    return compat.data ? profileToUser(compat.data as ProfileRow) : null;
  }

  return data ? profileToUser(data as ProfileRow) : null;
}

export async function getUser(userId: string): Promise<DBUser | null> {
  const profile = await getProfile(userId);
  if (profile) return profile;

  const db = readUsersSync();
  return db.users[userId] || null;
}

export async function getUserByEmail(email: string): Promise<DBUser | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("email", email)
      .maybeSingle();

    if (error) {
      const compat = await supabase
        .from("profiles")
        .select(PROFILE_SELECT_COMPAT)
        .eq("email", email)
        .maybeSingle();
      if (compat.error) {
        console.error("Supabase getUserByEmail error:", error);
      } else if (compat.data) {
        return profileToUser(compat.data as ProfileRow);
      }
    } else if (data) {
      return profileToUser(data as ProfileRow);
    }
  }

  const db = readUsersSync();
  return Object.values(db.users).find((u) => u.email === email) || null;
}

export async function createUser(user: DBUser): Promise<DBUser> {
  if (supabase) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan,
      api_key_hash: user.apiKey ? hashApiKey(user.apiKey) : null,
      api_key_last4: user.apiKey ? user.apiKey.slice(-4) : null,
      password_hash: user.passwordHash || null,
      email_verified_at: user.emailVerifiedAt || null,
      verification_code_hash: user.verificationCodeHash || null,
      verification_code_expires_at: user.verificationCodeExpiresAt || null,
    };
    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select(PROFILE_SELECT)
      .single();

    if (error) {
      const compatPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        image: buildAuthImagePayload(user) || user.image,
        plan: user.plan,
        api_key_hash: user.apiKey ? hashApiKey(user.apiKey) : null,
        api_key_last4: user.apiKey ? user.apiKey.slice(-4) : null,
      };
      const compat = await supabase
        .from("profiles")
        .upsert(compatPayload, { onConflict: "id" })
        .select(PROFILE_SELECT_COMPAT)
        .single();
      if (compat.error) {
        console.error("Supabase createUser error:", error);
      } else if (compat.data) {
        return profileToUser(compat.data as ProfileRow, user.apiKey);
      }
    } else if (data) {
      return profileToUser(data as ProfileRow, user.apiKey);
    }
  }

  const db = readUsersSync();
  db.users[user.id] = user;
  writeUsersSync(db);
  return user;
}

export async function updateUser(userId: string, updates: Partial<DBUser>): Promise<DBUser | null> {
  if (supabase) {
    const payload: Record<string, unknown> = {};
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.plan !== undefined) payload.plan = updates.plan;
    if (updates.apiKey !== undefined) {
      payload.api_key_hash = hashApiKey(updates.apiKey);
      payload.api_key_last4 = updates.apiKey.slice(-4);
    }
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.passwordHash !== undefined) payload.password_hash = updates.passwordHash;
    if (updates.emailVerifiedAt !== undefined) payload.email_verified_at = updates.emailVerifiedAt;
    if (updates.verificationCodeHash !== undefined) payload.verification_code_hash = updates.verificationCodeHash;
    if (updates.verificationCodeExpiresAt !== undefined) payload.verification_code_expires_at = updates.verificationCodeExpiresAt;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      const existing = await getProfile(userId);
      const compatPayload: Record<string, unknown> = {};
      if (updates.email !== undefined) compatPayload.email = updates.email;
      if (updates.name !== undefined) compatPayload.name = updates.name;
      if (updates.plan !== undefined) compatPayload.plan = updates.plan;
      if (updates.apiKey !== undefined) {
        compatPayload.api_key_hash = hashApiKey(updates.apiKey);
        compatPayload.api_key_last4 = updates.apiKey.slice(-4);
      }
      const merged = existing ? { ...existing, ...updates } : updates;
      const authPayload = buildAuthImagePayload(merged);
      if (authPayload) compatPayload.image = authPayload;
      else if (updates.image !== undefined) compatPayload.image = updates.image;
      compatPayload.updated_at = new Date().toISOString();

      const compat = await supabase
        .from("profiles")
        .update(compatPayload)
        .eq("id", userId)
        .select(PROFILE_SELECT_COMPAT)
        .maybeSingle();
      if (compat.error) {
        console.error("Supabase updateUser error:", error);
      } else if (compat.data) {
        return profileToUser(compat.data as ProfileRow, updates.apiKey);
      }
    } else if (data) {
      return profileToUser(data as ProfileRow, updates.apiKey);
    }
  }

  const db = readUsersSync();
  if (!db.users[userId]) return null;
  db.users[userId] = { ...db.users[userId], ...updates };
  writeUsersSync(db);
  return db.users[userId];
}

export async function getOrCreateUser(id: string, email: string, name: string, image?: string): Promise<DBUser> {
  const existing = await getUser(id);
  if (existing) return existing;
  return createUser({
    id,
    email,
    name,
    image,
    plan: "free",
    createdAt: new Date().toISOString(),
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashVerificationCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function buildAuthImagePayload(user: Partial<DBUser>) {
  if (!user.passwordHash && !user.emailVerifiedAt && !user.verificationCodeHash && !user.verificationCodeExpiresAt) {
    return null;
  }
  const payload = {
    passwordHash: user.passwordHash || null,
    emailVerifiedAt: user.emailVerifiedAt || null,
    verificationCodeHash: user.verificationCodeHash || null,
    verificationCodeExpiresAt: user.verificationCodeExpiresAt || null,
  };
  return AUTH_IMAGE_PREFIX + Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function parseAuthImagePayload(image?: string | null) {
  if (!image?.startsWith(AUTH_IMAGE_PREFIX)) return null;
  try {
    return JSON.parse(Buffer.from(image.slice(AUTH_IMAGE_PREFIX.length), "base64url").toString("utf8")) as {
      passwordHash?: string | null;
      emailVerifiedAt?: string | null;
      verificationCodeHash?: string | null;
      verificationCodeExpiresAt?: string | null;
    };
  } catch {
    return null;
  }
}

export function generateEmailVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function createEmailPasswordUser(email: string, password: string, name?: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false as const, error: "invalid_email" };
  }
  if (password.length < 8) {
    return { ok: false as const, error: "weak_password" };
  }

  const existing = await getUserByEmail(normalizedEmail);
  if (existing?.passwordHash && existing.emailVerifiedAt) {
    return { ok: false as const, error: "account_exists" };
  }

  const code = generateEmailVerificationCode();
  const passwordHash = await bcrypt.hash(password, 12);
  const codeHash = hashVerificationCode(code);
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const userId = existing?.id || `email:${normalizedEmail}`;

  const user: DBUser = {
    id: userId,
    email: normalizedEmail,
    name: name?.trim() || existing?.name || normalizedEmail.split("@")[0],
    image: existing?.image,
    plan: existing?.plan || "free",
    apiKey: existing?.apiKey,
    apiKeyLast4: existing?.apiKeyLast4,
    passwordHash,
    emailVerifiedAt: null,
    verificationCodeHash: codeHash,
    verificationCodeExpiresAt: codeExpiresAt,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  if (existing) {
    const updated = await updateUser(userId, user);
    return { ok: true as const, user: updated || user, code, expiresAt: codeExpiresAt };
  }

  return { ok: true as const, user: await createUser(user), code, expiresAt: codeExpiresAt };
}

export async function verifyEmailCode(email: string, code: string) {
  const user = await getUserByEmail(normalizeEmail(email));
  if (!user?.verificationCodeHash || !user.verificationCodeExpiresAt) {
    return { ok: false as const, error: "code_not_found" };
  }
  if (new Date(user.verificationCodeExpiresAt).getTime() < Date.now()) {
    return { ok: false as const, error: "code_expired" };
  }
  if (hashVerificationCode(code.trim()) !== user.verificationCodeHash) {
    return { ok: false as const, error: "invalid_code" };
  }

  await updateUser(user.id, {
    emailVerifiedAt: new Date().toISOString(),
    verificationCodeHash: null,
    verificationCodeExpiresAt: null,
  });
  return { ok: true as const, userId: user.id };
}

export async function authenticateEmailPassword(email: string, password: string) {
  const user = await getUserByEmail(normalizeEmail(email));
  if (!user?.passwordHash) return { ok: false as const, error: "invalid_credentials" };
  if (!user.emailVerifiedAt) return { ok: false as const, error: "email_unverified" };

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) return { ok: false as const, error: "invalid_credentials" };

  return { ok: true as const, user };
}
