const PUBLIC_ROUTE_PREFIXES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/auth/start",
  "/pricing",
  "/inspiration",
  "/knowledge",
  "/storyboard",
  "/tiktok-adgen",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  "/icon.svg",
  "/favicon.ico",
  "/api/auth",
  "/api/plans",
  "/api/pet-ad-pack",
  "/api/generate",
  "/api/variants",
  "/api/generations",
  "/api/inspiration",
  "/api/user",
  "/api/upgrade",
  "/api/team",
] as const;

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PREFIXES.some((path) => pathname === path || pathname.startsWith(path + "/"));
}
