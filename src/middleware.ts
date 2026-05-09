import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Check for dev bypass
  const devUserId = request.cookies.get("dev_user_id")?.value;
  const isDevLogin = request.nextUrl.pathname === "/dev-login";

  if (!devUserId && !isDevLogin) {
    return NextResponse.redirect(new URL("/dev-login", request.url));
  }

  // Auth disabled for development bypass
  return NextResponse.next();
}

export const config = {
  // Exclude: API routes, Next.js internals, static assets, auth routes, and public files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|icons|auth|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf)).*)",
  ],
};
