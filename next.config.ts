import path from "path";
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname), // ép root = backend
  experimental: {
    allowedDevOrigins: ["http://192.168.1.40:3000", "http://localhost:3000"]
  }
};
export default nextConfig;
