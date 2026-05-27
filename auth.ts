import NextAuth, { customFetch } from "next-auth";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import { isPublicRoute } from "@/lib/auth/routes";

const proxyFetch: typeof fetch = async (input, init) => {
  const proxyUrl = process.env.AUTH_PROXY_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!proxyUrl) return fetch(input, init);

  const { ProxyAgent } = await import("undici");
  return fetch(input, { ...init, dispatcher: new ProxyAgent(proxyUrl) } as RequestInit);
};

const GoogleOAuth: Provider = {
  id: "google",
  name: "Google",
  type: "oauth",
  issuer: "https://accounts.google.com",
  [customFetch]: proxyFetch,
  authorization: {
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    params: {
      scope: "openid email profile",
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    },
  },
  token: "https://oauth2.googleapis.com/token",
  userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
  profile(profile: { sub?: string; name?: string; email?: string; picture?: string }) {
    return {
      id: profile.sub || profile.email || "",
      name: profile.name || "",
      email: profile.email || "",
      image: profile.picture,
    };
  },
};

// WeChat custom provider
const WeChat: Provider = {
  id: "wechat",
  name: "WeChat",
  type: "oauth",
  authorization: {
    url: "https://open.weixin.qq.com/connect/qrconnect",
    params: { scope: "snsapi_login", appid: process.env.WECHAT_APP_ID },
  },
  token: {
    url: "https://api.weixin.qq.com/sns/oauth2/access_token",
    async request({ params }: { params: { code?: string } }) {
      const url = new URL("https://api.weixin.qq.com/sns/oauth2/access_token");
      url.searchParams.set("appid", process.env.WECHAT_APP_ID!);
      url.searchParams.set("secret", process.env.WECHAT_APP_SECRET!);
      url.searchParams.set("code", params.code!);
      url.searchParams.set("grant_type", "authorization_code");

      const res = await fetch(url);
      const data = (await res.json()) as { access_token?: string; openid?: string };

      return {
        tokens: {
          access_token: data.access_token,
          openid: data.openid,
          token_type: "bearer",
        },
      };
    },
  },
  userinfo: {
    url: "https://api.weixin.qq.com/sns/userinfo",
    async request({ tokens }: { tokens: { access_token?: string; openid?: string } }) {
      const url = new URL("https://api.weixin.qq.com/sns/userinfo");
      url.searchParams.set("access_token", tokens.access_token!);
      url.searchParams.set("openid", tokens.openid as string);
      url.searchParams.set("lang", "zh_CN");

      const res = await fetch(url);
      return await res.json();
    },
  },
  clientId: process.env.WECHAT_APP_ID,
  clientSecret: process.env.WECHAT_APP_SECRET,
  profile(profile: { unionid?: string; openid?: string; nickname?: string; headimgurl?: string }) {
    return {
      id: profile.unionid || profile.openid || "",
      name: profile.nickname || "",
      image: profile.headimgurl,
    };
  },
};

const providers: Provider[] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(GoogleOAuth);
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub);
}

if (process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET) {
  providers.push(WeChat);
}

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;

      if (isPublicRoute(nextUrl.pathname)) return true;
      if (isLoggedIn) return true;

      // Redirect unauthenticated users to login
      return Response.redirect(new URL("/sign-in", nextUrl));
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const id = (token.id as string | undefined) || session.user.email || "";
        session.user.id = id;
      }
      return session;
    },
  },
});
