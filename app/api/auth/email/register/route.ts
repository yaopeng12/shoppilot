import { sendVerificationEmail } from "@/lib/auth/email";
import { createEmailPasswordUser } from "@/lib/tiktok-adgen/db";
import { json } from "@/lib/tiktok-adgen/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password, name } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
  };

  const result = await createEmailPasswordUser(email || "", password || "", name);
  if (!result.ok) {
    const messageMap: Record<string, string> = {
      invalid_email: "Enter a valid email address.",
      weak_password: "Password must be at least 8 characters.",
      account_exists: "An account already exists for this email.",
    };
    return json(400, { error: result.error, message: messageMap[result.error] || "Could not create account." });
  }

  let emailSent = false;
  try {
    const emailResult = await sendVerificationEmail(result.user.email, result.code);
    emailSent = emailResult.sent;
  } catch {
    return json(500, { error: "email_send_failed", message: "Could not send verification email." });
  }

  return json(200, {
    ok: true,
    email: result.user.email,
    expiresAt: result.expiresAt,
    emailSent,
    devCode: process.env.NODE_ENV === "production" ? undefined : result.code,
  });
}
