import crypto from "crypto";
import bcrypt from "bcryptjs";

export function genKey() {
  return "tk_" + crypto.randomBytes(24).toString("hex");
}

export function genId() {
  return crypto.randomBytes(8).toString("hex");
}

export async function hashPw(pw: string) {
  // bcryptjs 为纯 JS 版本，避免 native 模块在不同环境安装失败
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function verifyPw(pw: string, hash: string) {
  try {
    return await bcrypt.compare(pw, hash);
  } catch {
    return false;
  }
}

