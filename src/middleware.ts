import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  // Auth disabled for development bypass
  return NextResponse.next()
}

export const config = {
  // Exclude: API routes, Next.js internals, static assets, auth routes, and public files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|icons|auth|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf)).*)" ,
  ],
}
