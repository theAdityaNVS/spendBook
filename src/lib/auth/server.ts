import { createNeonAuth } from "@neondatabase/auth/next/server"

if (!process.env.NEON_AUTH_BASE_URL) {
  throw new Error(
    "[SpendBook] Missing env var: NEON_AUTH_BASE_URL\n" +
      "Set it to your Neon Auth endpoint, e.g.\n" +
      "  https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth\n" +
      "Find it in: Neon Console → Project → Branch → Auth → Configuration",
  )
}

if (!process.env.NEON_AUTH_COOKIE_SECRET) {
  throw new Error(
    "[SpendBook] Missing env var: NEON_AUTH_COOKIE_SECRET\n" +
      "Generate one with: openssl rand -base64 32\n" +
      "Must be at least 32 characters for HMAC-SHA256",
  )
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET,
  },
})
