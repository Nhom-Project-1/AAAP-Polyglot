import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    ...( {
      middlewareInSrcDirectory: true, 
    } as any ),
    allowedDevOrigins: ["http://192.168.1.40:3000", "http://localhost:3000"],
  },
};

export default nextConfig;
