import { signIn } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const enabledProviders = new Set(["google", "github", "wechat"]);
const oauthCheckCookies = [
  "authjs.pkce.code_verifier",
  "authjs.state",
  "authjs.nonce",
  "authjs.callback-url",
  "__Secure-authjs.pkce.code_verifier",
  "__Secure-authjs.state",
  "__Secure-authjs.nonce",
  "__Secure-authjs.callback-url",
];

export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!enabledProviders.has(provider)) redirect("/sign-in");

  const cookieStore = await cookies();
  for (const name of oauthCheckCookies) {
    cookieStore.delete(name);
  }

  await signIn(provider, { redirectTo: "/" });
}
