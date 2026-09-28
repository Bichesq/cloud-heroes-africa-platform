import type { NextConfig } from "next";

/* Static security headers for every response (SECURITY.md §2/§11). The
 * Content-Security-Policy itself is per-request (nonce) and set in proxy.ts. */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Program Setup posts its thumbnail (≤ 2 MB, lib/image-upload.ts) through
    // a server action; the default 1 MB body limit would reject it.
    serverActions: { bodySizeLimit: "3mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
