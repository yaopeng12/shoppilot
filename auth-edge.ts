import NextAuth from "next-auth";
import { isPublicRoute } from "@/lib/auth/routes";

export const { auth } = NextAuth({
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      if (isPublicRoute(nextUrl.pathname)) return true;
      if (session?.user) return true;

      return Response.redirect(new URL("/sign-in", nextUrl));
    },
  },
});
