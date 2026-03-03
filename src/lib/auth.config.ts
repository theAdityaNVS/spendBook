import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe auth config — no heavy Node.js deps (no bcryptjs, no Prisma).
 * Imported by middleware.ts which runs in the Edge Runtime.
 * The full auth.ts extends this with the Credentials provider + PrismaAdapter.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const publicPaths = ["/login", "/register"]
      const isPublicPath = publicPaths.some((p) => pathname.startsWith(p))

      if (isPublicPath) {
        // Redirect logged-in users away from auth pages
        if (isLoggedIn) {
          return Response.redirect(new URL("/ledger", nextUrl))
        }
        return true
      }

      // Protect all other routes
      return isLoggedIn
    },
  },
} satisfies NextAuthConfig
