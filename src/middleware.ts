import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register"]
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p))

  if (isPublicPath) {
    // Redirect logged-in users away from auth pages
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/ledger", req.url))
    }
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons).*)"],
}
