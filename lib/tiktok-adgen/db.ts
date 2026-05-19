import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { DB } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

async function ensureDBFile() {
  if (!existsSync(DATA_DIR)) await fs.mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) {
    const empty: DB = { users: {}, teams: {}, sessions: {} };
    await fs.writeFile(DB_FILE, JSON.stringify(empty, null, 2));
  }
}

export async function loadDB(): Promise<DB> {
  await ensureDBFile();
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(raw) as DB;
  } catch {
    return { users: {}, teams: {}, sessions: {} };
  }
}

export async function saveDB(db: DB) {
  await ensureDBFile();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}
