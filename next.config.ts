import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // The root layout sits under [locale], so unmatched URLs need a standalone 404 page (src/app/global-not-found.tsx).
  experimental: { globalNotFound: true },
};

export default nextConfig;
