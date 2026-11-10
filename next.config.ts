import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  compress: true,
  generateEtags: true,
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
