/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Production build optimizations ───────────────────────────────────────
  // Don't leak the framework in headers.
  poweredByHeader: false,
  // Gzip handled by Vercel's edge; keep on for self-hosted fallback too.
  compress: true,
  // Source maps for the browser bundle are a info-leak + size cost in prod.
  productionBrowserSourceMaps: false,

  experimental: {
    typedRoutes: true,
    // Trim what ships to the client for these heavy libs.
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
  },

  // Remote images (none yet) — declare patterns here when product art lands.
  images: {
    remotePatterns: [],
  },

  // The API base + WS URL are the only runtime-public config. They're read
  // through src/lib/env.ts, never hardcoded. Listing them here documents the
  // contract and lets `next build` fail fast in CI if they're referenced
  // before being defined.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
};

export default nextConfig;
