import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ['better-sqlite3'],
  allowedDevOrigins: [
    'https://preview-chat-b9291c35-8cb8-41fc-9aaf-51742bc2ec64.space-z.ai',
    'https://*.space-z.ai',
  ],
};

export default nextConfig;
