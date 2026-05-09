import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure env vars are available to the build
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://ep-sweet-waterfall-a14zhs84.neonauth.ap-southeast-1.aws.neon.tech; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; frame-src 'self' https://ep-sweet-waterfall-a14zhs84.neonauth.ap-southeast-1.aws.neon.tech; connect-src 'self' https://ep-sweet-waterfall-a14zhs84.neonauth.ap-southeast-1.aws.neon.tech https://*.vercel-storage.com;",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
