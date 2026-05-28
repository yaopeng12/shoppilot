import nodemailer from "nodemailer";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildVerificationEmail(code: string) {
  const safeCode = escapeHtml(code);
  const text = [
    "Your ShopPilot verification code",
    "",
    `Code: ${code}`,
    "",
    "This code expires in 10 minutes.",
    "If you did not request this email, you can safely ignore it.",
    "",
    "ShopPilot",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your ShopPilot verification code</title>
  </head>
  <body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#101216;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7ebef;">
            <tr>
              <td style="background:#101216;padding:28px 32px;">
                <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.2px;">ShopPilot</div>
                <div style="margin-top:6px;font-size:13px;color:#9aa4b2;">Pet cleaning ad workflow</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0;font-size:24px;line-height:32px;color:#101216;">Verify your email</h1>
                <p style="margin:14px 0 0;font-size:15px;line-height:24px;color:#5d6673;">
                  Use this code to finish creating your ShopPilot account. It keeps your workspace and generated ad packs tied to the right email.
                </p>
                <div style="margin:28px 0;padding:22px 24px;border-radius:14px;background:#f7f9fb;border:1px solid #e5e9ef;text-align:center;">
                  <div style="font-size:12px;line-height:18px;color:#7b8490;text-transform:uppercase;letter-spacing:1.4px;">Verification code</div>
                  <div style="margin-top:10px;font-size:34px;line-height:42px;font-weight:700;letter-spacing:8px;color:#101216;">${safeCode}</div>
                </div>
                <p style="margin:0;font-size:14px;line-height:22px;color:#5d6673;">
                  This code expires in <strong style="color:#101216;">10 minutes</strong>. If you did not request this email, you can safely ignore it.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#f9fafb;border-top:1px solid #edf0f3;">
                <p style="margin:0;font-size:12px;line-height:18px;color:#8a93a0;">
                  This is an automated message from ShopPilot. Please do not reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

export async function sendVerificationEmail(email: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Email verification code for ${email}: ${code}`);
      return { sent: false, reason: "smtp_not_configured" as const };
    }
    throw new Error("SMTP is not configured");
  }

  const fromNameOrAddress = process.env.SMTP_FROM || user;
  const from = fromNameOrAddress.includes("@")
    ? fromNameOrAddress
    : `"${fromNameOrAddress.replace(/"/g, "")}" <${user}>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const message = buildVerificationEmail(code);

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your ShopPilot verification code",
    text: message.text,
    html: message.html,
  });

  return { sent: true as const };
}
