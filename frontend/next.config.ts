import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.ELECTRON_BUILD === 'true',
  },
  trailingSlash: true,
};

export default nextConfig;
