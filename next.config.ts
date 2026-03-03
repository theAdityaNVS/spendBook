import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Ensure env vars are available to the build
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
}

export default nextConfig
