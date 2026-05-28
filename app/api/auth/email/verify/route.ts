import { verifyEmailCode } from "@/lib/tiktok-adgen/db";
import { json } from "@/lib/tiktok-adgen/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, code } = (await req.json().catch(() => ({}))) as { email?: string; code?: string };
  const result = await verifyEmailCode(email || "", code || "");

  if (!result.ok) {
    const messageMap: Record<string, string> = {
      code_not_found: "Request a new verification code.",
      code_expired: "That code has expired.",
      invalid_code: "That code is not correct.",
    };
    return json(400, { error: result.error, message: messageMap[result.error] || "Could not verify email." });
  }

  return json(200, { ok: true });
}
