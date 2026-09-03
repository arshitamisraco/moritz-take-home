import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the on-screen dev/route indicator out of the rendered page —
  // compile and runtime errors are still surfaced.
  devIndicators: false,
};

export default nextConfig;
