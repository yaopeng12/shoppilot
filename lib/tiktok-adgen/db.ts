import fs from "fs/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

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
  createdAt: string;
};

type UsersDB = {
  users: Record<string, DBUser>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USAGE_FILE = path.join(DATA_DIR, "usage.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

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

export function getUser(userId: string): DBUser | null {
  const db = readUsersSync();
  return db.users[userId] || null;
}

export function getUserByEmail(email: string): DBUser | null {
  const db = readUsersSync();
  return Object.values(db.users).find((u) => u.email === email) || null;
}

export function createUser(user: DBUser): DBUser {
  const db = readUsersSync();
  db.users[user.id] = user;
  writeUsersSync(db);
  return user;
}

export function updateUser(userId: string, updates: Partial<DBUser>): DBUser | null {
  const db = readUsersSync();
  if (!db.users[userId]) return null;
  db.users[userId] = { ...db.users[userId], ...updates };
  writeUsersSync(db);
  return db.users[userId];
}

export function getOrCreateUser(id: string, email: string, name: string, image?: string): DBUser {
  const existing = getUser(id);
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
