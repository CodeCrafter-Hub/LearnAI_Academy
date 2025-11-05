const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost"],
  },
  experimental: {
    serverActions: true,
  },
  // Exclude API routes from static optimization
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  webpack: (config, { isServer }) => {
    // Add alias support for "@/..."
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    
    // Ignore Prisma during client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
