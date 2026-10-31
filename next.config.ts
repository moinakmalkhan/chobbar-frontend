import type { NextConfig } from "next";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ?? "http://localhost:8000";
const api = new URL(apiOrigin);
// Local development serves media from localhost; Next blocks optimising private IPs unless allowed.
const isLocalApi = ["localhost", "127.0.0.1", "0.0.0.0"].includes(api.hostname) || api.hostname.endsWith(".local");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowLocalIP: isLocalApi,
    remotePatterns: [
      { protocol: api.protocol.replace(":", "") as "http" | "https", hostname: api.hostname, port: api.port, pathname: "/media/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-accordion"],
  },
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Google sign-in needs its popup to talk back to this window.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/brand/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};

export default nextConfig;
