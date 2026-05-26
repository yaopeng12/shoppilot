import { signIn } from "@/auth";
import { redirect } from "next/navigation";

const enabledProviders = new Set(["google", "github", "wechat"]);

export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!enabledProviders.has(provider)) redirect("/sign-in");
  await signIn(provider, { redirectTo: "/" });
}
