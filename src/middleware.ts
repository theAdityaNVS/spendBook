import { auth } from "@/lib/auth/server"

export default auth.middleware({
  loginUrl: "/auth/sign-in",
})

export const config = {
  // Exclude: API routes, Next.js internals, static assets, auth routes, and public files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|icons|auth|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf)).*)" ,
  ],
}
