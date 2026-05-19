import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

type UsageDB = {
  usage: Record<string, Record<string, number>>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "usage.json");

async function ensureFile() {
  if (!existsSync(DATA_DIR)) await fs.mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) {
    await fs.writeFile(DB_FILE, JSON.stringify({ usage: {} }, null, 2));
  }
}

async function loadDB(): Promise<UsageDB> {
  await ensureFile();
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf-8")) as UsageDB;
  } catch {
    return { usage: {} };
  }
}

async function saveDB(db: UsageDB) {
  await ensureFile();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getUsage(userId: string): { used: number } {
  const db = readDBSync();
  const userUsage = db.usage[userId] || {};
  return { used: userUsage[todayKey()] || 0 };
}

export function recordUsage(userId: string) {
  const db = readDBSync();
  if (!db.usage[userId]) db.usage[userId] = {};
  const today = todayKey();
  db.usage[userId][today] = (db.usage[userId][today] || 0) + 1;

  // Prune old entries
  const monthAgo = todayKey().slice(0, 8);
  for (const k of Object.keys(db.usage[userId])) {
    if (k < monthAgo) delete db.usage[userId][k];
  }

  writeDBSync(db);
}

function readDBSync(): UsageDB {
  try {
    if (!existsSync(DB_FILE)) return { usage: {} };
    return JSON.parse(require("fs").readFileSync(DB_FILE, "utf-8")) as UsageDB;
  } catch {
    return { usage: {} };
  }
}

function writeDBSync(db: UsageDB) {
  try {
    if (!existsSync(DATA_DIR)) require("fs").mkdirSync(DATA_DIR, { recursive: true });
    require("fs").writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch {}
}
