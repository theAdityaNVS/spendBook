import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Required for Auth.js v5 with Next.js 15
  },
};

export default nextConfig;
