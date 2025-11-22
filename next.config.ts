/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    ...( {
    } as any ),
  },
};

export default nextConfig;
